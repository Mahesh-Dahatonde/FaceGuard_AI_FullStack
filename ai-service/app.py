from flask import Flask, request, jsonify
from flask_cors import CORS

import cv2
import numpy as np
import torch


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
    trust_repo=True
)

midas.eval()

device = torch.device("cpu")
midas.to(device)

midas_transforms = torch.hub.load(
    "intel-isl/MiDaS",
    "transforms",
    trust_repo=True
)

transform = midas_transforms.small_transform

print("MiDaS Model Loaded Successfully!")


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
        "device": "CPU",
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

    # Padding
    px = int(w * 0.20)
    py = int(h * 0.25)

    x1 = max(0, x - px)
    y1 = max(0, y - py)

    x2 = min(
        image.shape[1],
        x + w + px
    )

    y2 = min(
        image.shape[0],
        y + h + py
    )

    crop = image[
        y1:y2,
        x1:x2
    ]

    print(
        f"Face detected: x={x}, y={y}, "
        f"width={w}, height={h}"
    )

    return crop


# ============================================================
# STAGE 1
# SCREEN / PRINT / IMAGE CUE
# ============================================================

def stage1_spoof_analysis(image, face):

    try:

        gray = cv2.cvtColor(
            face,
            cv2.COLOR_BGR2GRAY
        )

        # ----------------------------------------------------
        # 1. Blur detection
        # ----------------------------------------------------

        laplacian = cv2.Laplacian(
            gray,
            cv2.CV_64F
        )

        lap_var = float(
            laplacian.var()
        )

        # ----------------------------------------------------
        # 2. High frequency analysis
        # ----------------------------------------------------

        fft = np.fft.fft2(gray)

        fft_shift = np.fft.fftshift(
            fft
        )

        magnitude = np.abs(
            fft_shift
        )

        h, w = magnitude.shape

        cy = h // 2
        cx = w // 2

        radius = min(h, w) // 8

        low_region = magnitude[
            cy-radius:cy+radius,
            cx-radius:cx+radius
        ]

        total_energy = np.sum(
            magnitude
        ) + 1e-8

        low_energy = np.sum(
            low_region
        )

        high_frequency_ratio = (
            1.0 -
            (low_energy / total_energy)
        )

        # ----------------------------------------------------
        # 3. Local contrast
        # ----------------------------------------------------

        mean_value = float(
            np.mean(gray)
        )

        std_value = float(
            np.std(gray)
        )

        contrast_score = min(
            100.0,
            std_value * 2.0
        )

        # ----------------------------------------------------
        # 4. Edge density
        # ----------------------------------------------------

        edges = cv2.Canny(
            gray,
            50,
            150
        )

        edge_density = (
            np.count_nonzero(edges)
            /
            edges.size
        )

        # ----------------------------------------------------
        # Screen/print likelihood
        #
        # This is a cue, NOT a standalone detector.
        # ----------------------------------------------------

        screen_score = 0.0

        # Low-frequency / display-like image
        if lap_var < 80:
            screen_score += 25

        if lap_var < 45:
            screen_score += 15

        # Strong repetitive frequency pattern
        if high_frequency_ratio > 0.35:
            screen_score += 20

        if high_frequency_ratio > 0.45:
            screen_score += 15

        # Very regular edge structure
        if edge_density < 0.08:
            screen_score += 10

        # Extreme contrast
        if std_value < 20 or std_value > 90:
            screen_score += 5

        screen_score = min(
            100.0,
            screen_score
        )

        # ----------------------------------------------------
        # Texture quality score
        # ----------------------------------------------------

        texture_score = min(
            100.0,
            (
                min(100.0, lap_var / 5.0) * 0.60
                +
                min(100.0, edge_density * 400) * 0.40
            )
        )

        print(
            "Stage 1 Laplacian:",
            round(lap_var, 2)
        )

        print(
            "Stage 1 Frequency Ratio:",
            round(high_frequency_ratio, 4)
        )

        print(
            "Stage 1 Edge Density:",
            round(edge_density, 4)
        )

        print(
            "Stage 1 Texture:",
            round(texture_score, 2)
        )

        print(
            "Stage 1 Screen/Print Score:",
            round(screen_score, 2)
        )

        return {
            "texture": round(
                float(texture_score),
                2
            ),
            "screen": round(
                float(screen_score),
                2
            )
        }

    except Exception as e:

        print(
            "Stage 1 Error:",
            e
        )

        return {
            "texture": 0.0,
            "screen": 0.0
        }


# ============================================================
# STAGE 2
# MiDaS DEPTH
# ============================================================

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

def analyze_face(image):

    # --------------------------------------------------------
    # Face detection
    # --------------------------------------------------------

    face = detect_face(image)

    if face is None:

        print(
            "No face detected."
        )

        return {
            "result": "SPOOF",
            "confidence": 80.0,
            "depthScore": 0.0,
            "textureScore": 0.0,
            "fusionScore": 20.0,
            "screenScore": 80.0
        }

    # --------------------------------------------------------
    # STAGE 1
    # --------------------------------------------------------

    stage1 = stage1_spoof_analysis(
        image,
        face
    )

    texture_score = stage1["texture"]
    screen_score = stage1["screen"]

    # --------------------------------------------------------
    # STAGE 2
    # --------------------------------------------------------

    depth_score = stage2_depth_analysis(
        face
    )

    # ========================================================
    # CASCADE DECISION
    # ========================================================

    # Strong display/print evidence
    # gets priority over depth.
    if screen_score >= 55:

        result = "SPOOF"

        confidence = min(
            95.0,
            55.0 + screen_score * 0.40
        )

        fusion_score = 100 - confidence

        print(
            "CASCADE: Strong spoof evidence"
        )

    else:

        # ----------------------------------------------------
        # Normal fusion
        #
        # Depth is no longer dominant.
        # ----------------------------------------------------

        real_evidence = (
            depth_score * 0.40
            +
            texture_score * 0.35
            +
            (100 - screen_score) * 0.25
        )

        fusion_score = max(
            0.0,
            min(
                100.0,
                real_evidence
            )
        )

        fusion_score = round(
            float(fusion_score),
            2
        )

        # ----------------------------------------------------
        # Conservative decision
        # ----------------------------------------------------

        if fusion_score >= 62:

            result = "REAL"

            confidence = fusion_score

        else:

            result = "SPOOF"

            confidence = 100 - fusion_score

    confidence = round(
        float(confidence),
        2
    )

    fusion_score = round(
        float(fusion_score),
        2
    )

    print("=" * 60)
    print("FINAL DECISION")
    print("Result:", result)
    print("Confidence:", confidence)
    print("Depth:", depth_score)
    print("Texture:", texture_score)
    print("Screen:", screen_score)
    print("Fusion:", fusion_score)
    print("=" * 60)

    return {
        "result": result,
        "confidence": confidence,
        "depthScore": depth_score,
        "textureScore": texture_score,
        "fusionScore": fusion_score,
        "screenScore": screen_score
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