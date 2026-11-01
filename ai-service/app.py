from flask import Flask, request, jsonify
from flask_cors import CORS

import cv2
import base64
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# MiDaS MODEL
# ============================================================

print("=" * 60)
print("Loading MiDaS Depth Model...")
print("=" * 60)

midas = torch.hub.load(
    "intel-isl/MiDaS",
    "MiDaS_small",
    trust_repo=True,
    skip_validation=True
)

midas.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
midas.to(device)

midas_transforms = torch.hub.load(
    "intel-isl/MiDaS",
    "transforms",
    trust_repo=True,
    skip_validation=True
)

transform = midas_transforms.small_transform

print("MiDaS Model Loaded Successfully!")
# ============================================================
# TRAINED MOBILENETV3 RGB MODEL
# ============================================================

print("Loading trained MobileNetV3 model...")

MODEL_PATH = (
    __import__("pathlib").Path(__file__).parent
    / "models"
    / "mobilenetv3_nuaa_best.pth"
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

rgb_model = models.mobilenet_v3_small(weights=None)

input_features = rgb_model.classifier[-1].in_features
rgb_model.classifier[-1] = nn.Linear(input_features, 2)

rgb_model.load_state_dict(checkpoint["model_state_dict"])
rgb_model.to(device)
rgb_model.eval()

rgb_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

print("MobileNetV3 Loaded Successfully!")
print("RGB Model Device:", device)
print("Class Mapping:", checkpoint["class_to_idx"])


# ============================================================
# FACE DETECTOR
# ============================================================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

print("Face Detector Loaded Successfully!")
print("=" * 60)


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "AI service running",
        "service": "FaceGuard AI",
        "model": "MiDaS_small",
        "device": str(device).upper(),
        "framework": "Two-Stage Cascade"
    })


# ============================================================
# FACE DETECTION
# ============================================================

def detect_face(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Improve contrast
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    if len(faces) == 0:
        return None

    # Largest face
    x, y, w, h = max(
        faces,
        key=lambda r: r[2] * r[3]
    )

        # Equal padding on all sides
    padding = int(max(w, h) * 0.20)

    x1 = max(0, x - padding)
    y1 = max(0, y - padding)

    x2 = min(image.shape[1], x + w + padding)
    y2 = min(image.shape[0], y + h + padding)

    crop = image[y1:y2, x1:x2]

    if crop.size == 0:
        return None

    print(
        f"Face detected: x={x}, y={y}, "
        f"width={w}, height={h}"
    )

    print(
        f"Face crop size: {crop.shape[1]}x{crop.shape[0]}"
    )

    return crop


# ============================================================
# STAGE 1
# SCREEN / PRINT / IMAGE CUE
# ============================================================

# ============================================================
# STAGE 1 - TRAINED MOBILENETV3 RGB CLASSIFIER
# ============================================================

def stage1_spoof_analysis(face):

    image_rgb = cv2.cvtColor(
        face,
        cv2.COLOR_BGR2RGB
    )

    input_tensor = rgb_transform(image_rgb)
    input_tensor = input_tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = rgb_model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

    real_score = float(probabilities[0].item()) * 100.0
    spoof_score = float(probabilities[1].item()) * 100.0

    print("Stage 1 MobileNet REAL:", round(real_score, 2))
    print("Stage 1 MobileNet SPOOF:", round(spoof_score, 2))

    return {
        "real": round(real_score, 2),
        "spoof": round(spoof_score, 2)
    }


# ============================================================
# STAGE 2
# MiDaS DEPTH
# ============================================================# ============================================================
# STAGE 2
# MiDaS DEPTH
# ============================================================
def create_depth_map_image(face):
    image_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    input_batch = transform(image_rgb).to(device)

    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=image_rgb.shape[:2],
            mode="bicubic",
            align_corners=False
        ).squeeze()

    depth_map = prediction.cpu().numpy()

    depth_normalized = cv2.normalize(
        depth_map,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    ).astype(np.uint8)

    depth_colormap = cv2.applyColorMap(
        depth_normalized,
        cv2.COLORMAP_INFERNO
    )

    success, encoded_image = cv2.imencode(".jpg", depth_colormap)

    if not success:
        return None

    return base64.b64encode(encoded_image).decode("utf-8")

def stage2_depth_analysis(face):

    try:

        image_rgb = cv2.cvtColor(
            face,
            cv2.COLOR_BGR2RGB
        )

        input_batch = transform(
            image_rgb
        )

        input_batch = input_batch.to(
            device
        )

        with torch.no_grad():

            prediction = midas(
                input_batch
            )

            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=image_rgb.shape[:2],
                mode="bicubic",
                align_corners=False
            ).squeeze()

        depth_map = prediction.cpu().numpy()

        depth_min = depth_map.min()
        depth_max = depth_map.max()

        if depth_max - depth_min == 0:
            return 0.0

        depth_normalized = (
            (depth_map - depth_min)
            /
            (depth_max - depth_min)
        )

        # ----------------------------------------------------
        # Depth variation
        # ----------------------------------------------------

        depth_std = float(
            np.std(depth_normalized)
        )

        variation_score = min(
            100.0,
            depth_std * 250
        )

        # ----------------------------------------------------
        # Center region
        # ----------------------------------------------------

        h, w = depth_normalized.shape

        center = depth_normalized[
            int(h * 0.25):int(h * 0.75),
            int(w * 0.25):int(w * 0.75)
        ]

        outer = np.concatenate([
            depth_normalized[
                0:int(h * 0.20),
                :
            ].flatten(),

            depth_normalized[
                int(h * 0.80):,
                :
            ].flatten()
        ])

        center_mean = float(
            np.mean(center)
        )

        outer_mean = float(
            np.mean(outer)
        )

        structure_difference = abs(
            center_mean - outer_mean
        )

        structure_score = min(
            100.0,
            structure_difference * 500
        )

        depth_score = (
            variation_score * 0.60
            +
            structure_score * 0.40
        )

        depth_score = min(
            100.0,
            depth_score
        )

        print(
            "Stage 2 Depth Variation:",
            round(variation_score, 2)
        )

        print(
            "Stage 2 Depth Structure:",
            round(structure_score, 2)
        )

        print(
            "Stage 2 Final Depth:",
            round(depth_score, 2)
        )

        return round(
            float(depth_score),
            2
        )

    except Exception as e:

        print(
            "Stage 2 Depth Error:",
            e
        )

        return 0.0


# ============================================================
# TWO-STAGE FUSION
# ============================================================

# ============================================================
# TWO-STAGE DATA FUSION
# ============================================================

def analyze_face(image):

    face = detect_face(image)

    if face is None:
        print("No face detected.")

        return {
            "result": "NO_FACE",
            "confidence": 0.0,
            "depthScore": 0.0,
            "textureScore": 0.0,
            "fusionScore": 0.0,
            "screenScore": 0.0,
            "rgbRealScore": 0.0,
            "rgbSpoofScore": 0.0
        }

    # STAGE 1: MobileNetV3
    stage1 = stage1_spoof_analysis(face)

    rgb_real_score = stage1["real"]
    rgb_spoof_score = stage1["spoof"]

    # STAGE 2: MiDaS Depth
    depth_score = stage2_depth_analysis(face)
    depth_map_image = create_depth_map_image(face)

    # PROVISIONAL FUSION
    # These weights need validation and calibration.
        # PROVISIONAL RGB + DEPTH FUSION
    # Weights are experimental and require proper validation.
    RGB_WEIGHT = 0.80
    DEPTH_WEIGHT = 0.20

    fusion_score = (
        RGB_WEIGHT * rgb_real_score
        + DEPTH_WEIGHT * depth_score
    )

    fusion_score = round(
        max(0.0, min(100.0, fusion_score)),
        2
    )

    result = "REAL" if fusion_score >= 50 else "SPOOF"

    confidence = max(
        fusion_score,
        100.0 - fusion_score
    )

    confidence = round(float(confidence), 2)

    print("=" * 60)
    print("FINAL DECISION")
    print("Result:", result)
    print("Confidence:", confidence)
    print("MobileNet REAL:", rgb_real_score)
    print("MobileNet SPOOF:", rgb_spoof_score)
    print("Depth:", depth_score)
    print("Fusion:", fusion_score)
    print("=" * 60)

    return {
        "result": result,
        "confidence": confidence,
        "depthScore": depth_score,
        "depthMapImage": depth_map_image,

        # Existing frontend fields kept for compatibility
        "textureScore": rgb_real_score,
        "screenScore": rgb_spoof_score,

        "fusionScore": fusion_score,

        # New descriptive fields
        "rgbRealScore": rgb_real_score,
        "rgbSpoofScore": rgb_spoof_score
    }
# ============================================================
# ANALYZE API
# ============================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "message": "Image file is required"
            }), 400

        file = request.files["image"]

        image_bytes = file.read()

        image_array = np.frombuffer(
            image_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image is None:

            return jsonify({
                "success": False,
                "message": "Invalid image"
            }), 400

        print("\n")
        print("=" * 60)
        print("NEW IMAGE RECEIVED")
        print("=" * 60)

        print(
            "Image size:",
            image.shape
        )

        result = analyze_face(
            image
        )

        return jsonify({
            "success": True,
            "message": "Face analysis completed",
            **result
        })

    except Exception as e:

        print(
            "Analysis Error:",
            e
        )

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    import os

    port = int(os.environ.get("PORT", 5000))

    print("=" * 60)
    print("FaceGuard AI Service")
    print("Two-Stage Cascading Anti-Spoofing")
    print(f"Running on port {port}")
    print("=" * 60)

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )