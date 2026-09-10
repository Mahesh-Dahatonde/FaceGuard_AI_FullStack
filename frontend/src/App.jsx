import React, { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  ScanFace,
  LayoutDashboard,
  History as HistoryIcon,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Activity,
  Cpu,
  Zap,
  ChevronRight,
  Camera,
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  BrainCircuit,
  Layers3,
  Database,
  Menu,
  X,
  ArrowRight,
  CircleHelp,
  MessageCircle,
  BookOpen,
} from "lucide-react";

const API = "https://faceguard-ai-fullstack.onrender.com/api";
const AI_API = "http://localhost:5000";

/* =========================
   API HELPERS
========================= */

async function get(path) {
  const res = await fetch(API + path);

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}

async function post(path, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

async function remove(path) {
  const res = await fetch(API + path, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }

  return true;
}

/* =========================
   USER STORAGE
========================= */

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("faceguard_user") || "null");
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("faceguard_user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("faceguard_user");
}

/* =========================
   NAVBAR
========================= */

function Navbar({ user, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  function logout() {
    clearUser();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="brand" onClick={() => navigate("/")}>
        <div className="brand-icon">
          <ShieldCheck size={25} />
        </div>

        <div>
          <div className="brand-name">FaceGuard</div>
          <div className="brand-sub">AI SECURITY</div>
        </div>
      </div>

      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      <nav className={`top-nav ${mobileOpen ? "mobile-show" : ""}`}>
        <Link to="/" onClick={() => setMobileOpen(false)}>
          Dashboard
        </Link>

        <Link to="/scan" onClick={() => setMobileOpen(false)}>
          Face Scan
        </Link>

        <Link to="/history" onClick={() => setMobileOpen(false)}>
          History
        </Link>

        <Link to="/how-it-works" onClick={() => setMobileOpen(false)}>
          How It Works
        </Link>
      </nav>

      <div className="user-area">
        <div className="user-avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{user?.name || "User"}</strong>
          <span>Protected account</span>
        </div>

        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar({ user }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-title">WORKSPACE</div>

      <Link className="side-link active" to="/">
        <LayoutDashboard size={19} />
        <span>Dashboard</span>
      </Link>

      <Link className="side-link" to="/scan">
        <ScanFace size={19} />
        <span>Face Scan</span>
        <span className="new-badge">AI</span>
      </Link>

      <Link className="side-link" to="/history">
        <HistoryIcon size={19} />
        <span>Scan History</span>
      </Link>

      <div className="sidebar-title second">ACCOUNT</div>

      <Link className="side-link" to="/profile">
        <User size={19} />
        <span>My Profile</span>
      </Link>

      <Link className="side-link" to="/settings">
        <SettingsIcon size={19} />
        <span>Settings</span>
      </Link>

      <Link className="side-link" to="/support">
        <HelpCircle size={19} />
        <span>Support</span>
      </Link>

      <div className="sidebar-bottom">
        <div className="sidebar-security">
          <div className="security-icon">
            <Shield size={18} />
          </div>

          <div>
            <strong>System Secure</strong>
            <span>All services operational</span>
          </div>

          <span className="online-dot"></span>
        </div>

        <button
          className="sidebar-project"
          onClick={() => navigate("/how-it-works")}
        >
          <Sparkles size={17} />
          <span>About FaceGuard AI</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </aside>
  );
}

/* =========================
   LAYOUT
========================= */

function Layout({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="body-layout">
        <Sidebar user={user} />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

/* =========================
   LOGIN
========================= */

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await post("/auth/login", {
        email,
        password: pass,
      });

      saveUser(data);
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="grid-background"></div>
      </div>

      <div className="auth-brand">
        <div className="brand-icon large">
          <ShieldCheck size={30} />
        </div>

        <div>
          <div className="brand-name">FaceGuard</div>
          <div className="brand-sub">AI SECURITY PLATFORM</div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <div className="auth-mini-icon">
            <Lock size={20} />
          </div>

          <h1>Welcome back</h1>
          <p>Sign in to access your AI security workspace.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <label>Email address</label>

          <div className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="input-wrap">
            <Lock size={18} />

            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="primary-btn full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to FaceGuard"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-divider">
          <span>NEW TO FACEGUARD?</span>
        </div>

        <Link to="/register" className="secondary-btn full">
          Create an account
        </Link>

        <div className="auth-security">
          <ShieldCheck size={15} />
          Your security is our priority
        </div>
      </div>
    </div>
  );
}

/* =========================
   REGISTER
========================= */

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await post("/auth/register", {
        name,
        email,
        password: pass,
      });

      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try another email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="grid-background"></div>
      </div>

      <div className="auth-brand">
        <div className="brand-icon large">
          <ShieldCheck size={30} />
        </div>

        <div>
          <div className="brand-name">FaceGuard</div>
          <div className="brand-sub">AI SECURITY PLATFORM</div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <div className="auth-mini-icon">
            <Sparkles size={20} />
          </div>

          <h1>Create your account</h1>
          <p>Start protecting your identity with AI.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <label>Full name</label>

          <div className="input-wrap">
            <User size={18} />
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <label>Email address</label>

          <div className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="input-wrap">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Create a password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn full" disabled={loading}>
            {loading ? "Creating account..." : "Create secure account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-bottom">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({ user }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    real: 0,
    spoof: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await get("/scans/" + user.userId);

        const total = data.length;
        const real = data.filter(
          (x) => String(x.result).toUpperCase() === "REAL"
        ).length;

        const spoof = data.filter(
          (x) => String(x.result).toUpperCase() === "SPOOF"
        ).length;

        setStats({
          total,
          real,
          spoof,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user.userId]);

  return (
    <div className="page">
      {/* HERO */}

      <section className="hero-card">
        <div className="hero-content">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            SECURE AI WORKSPACE
          </div>

          <h1>
            Welcome back,
            <br />
            <span>{user?.name || "User"}</span>
          </h1>

          <p>
            Verify faces with intelligent multi-modal anti-spoofing
            technology powered by AI.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/scan")}
            >
              <ScanFace size={19} />
              Start Face Scan
              <ArrowRight size={17} />
            </button>

            <button
              className="glass-btn"
              onClick={() => navigate("/how-it-works")}
            >
              <BookOpen size={18} />
              How it works
            </button>
          </div>

          <div className="hero-trust">
            <div>
              <CheckCircle2 size={16} />
              Two-stage detection
            </div>

            <div>
              <CheckCircle2 size={16} />
              Monocular depth
            </div>

            <div>
              <CheckCircle2 size={16} />
              Data fusion
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="ai-core">
            <div className="core-ring">
              <ShieldCheck size={65} />
            </div>

            <div className="core-label">
              <strong>AI ENGINE</strong>
              <span>
                <i></i> ONLINE
              </span>
            </div>
          </div>

          <div className="floating-chip chip-one">
            <BrainCircuit size={17} />
            Depth AI
          </div>

          <div className="floating-chip chip-two">
            <Layers3 size={17} />
            Fusion
          </div>

          <div className="floating-chip chip-three">
            <Activity size={17} />
            Liveness
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="stats-grid">
        <StatCard
          icon={<Database />}
          title="Total Scans"
          value={loading ? "..." : stats.total}
          text="All time analyses"
          className="blue"
        />

        <StatCard
          icon={<CheckCircle2 />}
          title="REAL Detected"
          value={loading ? "..." : stats.real}
          text="Authentic faces"
          className="green"
        />

        <StatCard
          icon={<XCircle />}
          title="SPOOF Detected"
          value={loading ? "..." : stats.spoof}
          text="Potential attacks"
          className="red"
        />

        <StatCard
          icon={<Cpu />}
          title="AI Status"
          value="ONLINE"
          text="MiDaS + Fusion"
          className="purple"
        />
      </section>

      {/* MAIN GRID */}

      <section className="dashboard-grid">
        <div className="feature-card scan-feature">
          <div className="feature-top">
            <div className="feature-icon blue-bg">
              <ScanFace size={25} />
            </div>

            <div className="live-badge">
              <span></span>
              READY
            </div>
          </div>

          <h2>Face Anti-Spoofing</h2>

          <p>
            Analyze a live camera frame using texture analysis, depth
            estimation and intelligent data fusion.
          </p>

          <div className="feature-points">
            <div>
              <CheckCircle2 size={16} />
              Texture & screen analysis
            </div>

            <div>
              <CheckCircle2 size={16} />
              Monocular depth estimation
            </div>

            <div>
              <CheckCircle2 size={16} />
              Multi-modal fusion
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/scan")}
          >
            Launch AI Scanner
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="pipeline-card">
          <div className="section-label">
            <Zap size={15} />
            DETECTION PIPELINE
          </div>

          <h2>Two-stage intelligence</h2>

          <div className="pipeline">
            <Pipeline
              number="01"
              icon={<Activity />}
              title="Texture Analysis"
              text="Surface, edges & screen patterns"
            />

            <div className="pipeline-line"></div>

            <Pipeline
              number="02"
              icon={<Layers3 />}
              title="Depth Estimation"
              text="Monocular facial depth structure"
            />

            <div className="pipeline-line"></div>

            <Pipeline
              number="03"
              icon={<BrainCircuit />}
              title="Data Fusion"
              text="Combines evidence for final result"
            />
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">QUICK ACCESS</span>
            <h2>Everything you need</h2>
          </div>
        </div>

        <div className="quick-grid">
          <QuickCard
            icon={<HistoryIcon />}
            title="Scan History"
            text="Review previous AI results"
            to="/history"
          />

          <QuickCard
            icon={<User />}
            title="My Profile"
            text="Manage your account"
            to="/profile"
          />

          <QuickCard
            icon={<SettingsIcon />}
            title="Settings"
            text="Customize your workspace"
            to="/settings"
          />

          <QuickCard
            icon={<CircleHelp />}
            title="Support"
            text="Get help with FaceGuard"
            to="/support"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ icon, title, value, text, className }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>

      <div className="stat-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}

/* =========================
   PIPELINE
========================= */

function Pipeline({ number, icon, title, text }) {
  return (
    <div className="pipeline-step">
      <div className="pipeline-number">{number}</div>

      <div className="pipeline-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

/* =========================
   QUICK CARD
========================= */

function QuickCard({ icon, title, text, to }) {
  return (
    <Link to={to} className="quick-card">
      <div className="quick-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <ChevronRight size={18} />
    </Link>
  );
}

/* =========================
   SCAN
========================= */

function Scan() {
  const video = useRef(null);
  const streamRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  async function startCamera() {
    try {
      setMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (video.current) {
        video.current.srcObject = stream;
        await video.current.play();
      }

      setRunning(true);
      setResult(null);
    } catch (err) {
      setMessage(
        "Camera access failed. Please allow camera permission and try again."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (video.current) {
      video.current.srcObject = null;
    }

    setRunning(false);
  }

  async function analyze() {
    if (!video.current) return;

    try {
      setLoading(true);
      setMessage("");

      const canvas = document.createElement("canvas");

      canvas.width = video.current.videoWidth || 640;
      canvas.height = video.current.videoHeight || 480;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        video.current,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      const response = await fetch(AI_API + "/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI service failed");
      }

      const data = await response.json();

      const resultData = {
        result: data.result,
        confidence: data.confidence,
        depthScore: data.depthScore,
        textureScore: data.textureScore,
        fusionScore: data.fusionScore,
        screenScore: data.screenScore,
      };

      setResult(resultData);
      stopCamera();

      const user = getUser();

      if (user?.userId) {
        try {
          await post("/scans", {
            userId: user.userId,
            ...resultData,
          });
        } catch (saveError) {
          console.error("History save failed", saveError);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage(
        "AI analysis failed. Make sure the Python AI service is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">AI VERIFICATION</span>
          <h1>Face Scan</h1>
          <p>
            Position your face inside the frame and start the AI analysis.
          </p>
        </div>

        <div className="status-pill">
          <span className="pulse-dot"></span>
          AI SERVICE ONLINE
        </div>
      </div>

      <div className="scan-layout">
        <div className="camera-card">
          <div className="camera-header">
            <div>
              <strong>Live Camera</strong>
              <span>Secure local capture</span>
            </div>

            <div className="camera-status">
              <span></span>
              {running ? "LIVE" : "IDLE"}
            </div>
          </div>

          <div className="camera-box">
            <video ref={video} autoPlay muted playsInline />

            {!running && (
              <div className="camera-placeholder">
                <div className="camera-big-icon">
                  <Camera size={42} />
                </div>

                <h3>Camera ready</h3>

                <p>
                  Start your camera to begin the face verification process.
                </p>

                <button
                  className="primary-btn"
                  onClick={startCamera}
                  disabled={loading}
                >
                  <Camera size={18} />
                  Start Camera
                </button>
              </div>
            )}

            {running && (
              <div className="face-guide">
                <div className="guide-corner top-left"></div>
                <div className="guide-corner top-right"></div>
                <div className="guide-corner bottom-left"></div>
                <div className="guide-corner bottom-right"></div>

                <div className="face-oval"></div>

                <div className="camera-hint">
                  Keep your face centered
                </div>
              </div>
            )}
          </div>

          {running && (
            <div className="camera-controls">
              <button className="danger-btn" onClick={stopCamera}>
                Stop
              </button>

              <button
                className="primary-btn"
                onClick={analyze}
                disabled={loading}
              >
                <ScanFace size={18} />
                {loading ? "Analyzing..." : "Analyze Face"}
              </button>
            </div>
          )}

          {message && <div className="error-box">{message}</div>}
        </div>

        <div className="scan-info-card">
          <div className="section-label">
            <BrainCircuit size={15} />
            HOW AI CHECKS YOU
          </div>

          <h2>Multi-modal verification</h2>

          <p>
            FaceGuard uses multiple signals instead of relying on a single
            visual feature.
          </p>

          <div className="scan-method">
            <div className="method-icon">
              <Activity />
            </div>

            <div>
              <strong>Stage 1</strong>
              <span>Texture & Screen Analysis</span>
            </div>
          </div>

          <div className="scan-method">
            <div className="method-icon">
              <Layers3 />
            </div>

            <div>
              <strong>Stage 2</strong>
              <span>Monocular Depth Estimation</span>
            </div>
          </div>

          <div className="scan-method">
            <div className="method-icon">
              <BrainCircuit />
            </div>

            <div>
              <strong>Final Stage</strong>
              <span>Data Fusion Decision</span>
            </div>
          </div>

          <div className="scan-tip">
            <Zap size={18} />
            <div>
              <strong>Best results</strong>
              <span>
                Use good lighting and keep your full face visible.
              </span>
            </div>
          </div>
        </div>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}

/* =========================
   RESULT
========================= */

function ResultCard({ result }) {
  const isReal = String(result.result).toUpperCase() === "REAL";

  return (
    <div className={`result-card ${isReal ? "result-real" : "result-spoof"}`}>
      <div className="result-main">
        <div className="result-icon">
          {isReal ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
        </div>

        <div>
          <span className="result-label">FINAL DECISION</span>

          <h2>{isReal ? "REAL FACE" : "SPOOF DETECTED"}</h2>

          <p>
            {isReal
              ? "The analysis indicates an authentic face."
              : "The analysis indicates possible presentation attack characteristics."}
          </p>
        </div>
      </div>

      <div className="confidence-box">
        <span>Confidence</span>
        <strong>{Number(result.confidence || 0).toFixed(1)}%</strong>
      </div>

      <div className="result-metrics">
        <Metric
          title="Depth"
          value={result.depthScore}
        />

        <Metric
          title="Texture"
          value={result.textureScore}
        />

        <Metric
          title="Screen"
          value={result.screenScore}
        />

        <Metric
          title="Fusion"
          value={result.fusionScore}
        />
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  const num = Number(value || 0);

  return (
    <div className="metric">
      <div className="metric-head">
        <span>{title}</span>
        <strong>{num.toFixed(1)}</strong>
      </div>

      <div className="metric-bar">
        <div style={{ width: `${Math.min(100, Math.max(0, num))}%` }} />
      </div>
    </div>
  );
}

/* =========================
   HISTORY
========================= */

function History() {
  const user = getUser();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setItems(await get("/scans/" + user.userId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteScan(id) {
    const ok = window.confirm("Delete this scan?");

    if (!ok) return;

    try {
      await remove("/scans/" + id);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">SECURITY RECORDS</span>
          <h1>Scan History</h1>
          <p>Review your previous FaceGuard AI analyses.</p>
        </div>

        <Link to="/scan" className="primary-btn">
          <ScanFace size={18} />
          New Scan
        </Link>
      </div>

      {loading ? (
        <div className="empty-card">
          <Activity className="spin" size={35} />
          <h3>Loading scan history...</h3>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">
            <HistoryIcon size={35} />
          </div>

          <h2>No scans yet</h2>

          <p>
            Your AI verification results will appear here after your first
            scan.
          </p>

          <Link to="/scan" className="primary-btn">
            Start your first scan
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="history-card">
          <div className="history-header">
            <span>Date</span>
            <span>Result</span>
            <span>Confidence</span>
            <span>Depth</span>
            <span>Texture</span>
            <span>Fusion</span>
            <span>Action</span>
          </div>

          {items.map((item, index) => {
            const real =
              String(item.result).toUpperCase() === "REAL";

            return (
              <div className="history-row" key={item.id || index}>
                <span>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "—"}
                </span>

                <span>
                  <b className={`result-tag ${real ? "real" : "spoof"}`}>
                    {real ? "REAL" : "SPOOF"}
                  </b>
                </span>

                <strong>
                  {Number(item.confidence || 0).toFixed(1)}%
                </strong>

                <span>{Number(item.depthScore || 0).toFixed(1)}</span>

                <span>{Number(item.textureScore || 0).toFixed(1)}</span>

                <span>{Number(item.fusionScore || 0).toFixed(1)}</span>

                <button
                  className="delete-btn"
                  onClick={() => deleteScan(item.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   PROFILE
========================= */

function Profile({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your FaceGuard account information.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>

          <h2>{user?.name || "User"}</h2>
          <p>{user?.email || "No email available"}</p>

          <div className="verified-badge">
            <CheckCircle2 size={15} />
            Account Active
          </div>
        </div>

        <div className="settings-card">
          <div className="card-heading">
            <User size={20} />
            <div>
              <h2>Account Information</h2>
              <p>Your registered account details</p>
            </div>
          </div>

          <div className="profile-field">
            <span>Full Name</span>
            <strong>{user?.name || "—"}</strong>
          </div>

          <div className="profile-field">
            <span>Email Address</span>
            <strong>{user?.email || "—"}</strong>
          </div>

          <div className="profile-field">
            <span>Account ID</span>
            <strong>{user?.userId || "—"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SETTINGS
========================= */

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Customize your FaceGuard workspace.</p>
        </div>
      </div>

      <div className="settings-card wide">
        <div className="card-heading">
          <SettingsIcon size={20} />

          <div>
            <h2>Workspace Preferences</h2>
            <p>Control how the application behaves.</p>
          </div>
        </div>

        <SettingRow
          icon={<Activity />}
          title="Scan Notifications"
          text="Show notifications after AI analysis."
          enabled={notifications}
          setEnabled={setNotifications}
        />

        <SettingRow
          icon={<Zap />}
          title="Result Sound"
          text="Play a sound when a scan is completed."
          enabled={sound}
          setEnabled={setSound}
        />

        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-icon">
              <ShieldCheck />
            </div>

            <div>
              <strong>AI Security Mode</strong>
              <span>Two-stage anti-spoofing analysis is enabled.</span>
            </div>
          </div>

          <div className="enabled-label">
            <CheckCircle2 size={16} />
            Enabled
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  text,
  enabled,
  setEnabled,
}) {
  return (
    <div className="setting-row">
      <div className="setting-left">
        <div className="setting-icon">{icon}</div>

        <div>
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      </div>

      <button
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={() => setEnabled(!enabled)}
      >
        <span></span>
      </button>
    </div>
  );
}

/* =========================
   HOW IT WORKS
========================= */

function HowItWorks() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">TECHNOLOGY</span>
          <h1>How FaceGuard Works</h1>
          <p>
            Understand the two-stage architecture behind the verification
            process.
          </p>
        </div>
      </div>

      <div className="technology-hero">
        <div className="tech-icon">
          <BrainCircuit size={42} />
        </div>

        <h2>Data Fusion-Based AI Verification</h2>

        <p>
          FaceGuard combines visual texture information with monocular depth
          information to make a more informed anti-spoofing decision.
        </p>
      </div>

      <div className="tech-grid">
        <TechCard
          number="01"
          icon={<Activity />}
          title="Texture & Screen Analysis"
          text="The first stage examines image texture, edges, frequency information and visual patterns that can indicate a presentation attack."
        />

        <TechCard
          number="02"
          icon={<Layers3 />}
          title="Monocular Depth Estimation"
          text="The second stage uses the MiDaS depth model to estimate spatial depth characteristics from the captured face image."
        />

        <TechCard
          number="03"
          icon={<BrainCircuit />}
          title="Data Fusion"
          text="Signals from different analysis stages are combined into a final decision score for REAL or SPOOF."
        />
      </div>
    </div>
  );
}

function TechCard({ number, icon, title, text }) {
  return (
    <div className="tech-card">
      <div className="tech-number">{number}</div>

      <div className="tech-card-icon">{icon}</div>

      <h2>{title}</h2>

      <p>{text}</p>
    </div>
  );
}

/* =========================
   SUPPORT
========================= */

/* =========================
   SUPPORT - CHATGPT STYLE
========================= */

function Support() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text:
        "Hi! 👋 I'm FaceGuard Support AI. I can help you with Face Scan, camera issues, AI results, backend connection, and understanding how FaceGuard works.",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const suggestions = [
    "Why is my camera not working?",
    "How does FaceGuard detect spoofing?",
    "What does REAL result mean?",
    "Why is AI service not working?",
  ];

  function getReply(question) {
    const q = question.toLowerCase();

    if (
      q.includes("camera") ||
      q.includes("permission") ||
      q.includes("webcam")
    ) {
      return (
        "📷 **Camera troubleshooting**\n\n" +
        "1. Open Face Scan.\n" +
        "2. Click **Start Camera**.\n" +
        "3. Allow camera permission in your browser.\n" +
        "4. Keep your face centered inside the guide.\n" +
        "5. Make sure no other application is using the camera.\n\n" +
        "For the best result, use good lighting and keep your full face visible."
      );
    }

    if (
      q.includes("spoof") ||
      q.includes("fake") ||
      q.includes("attack")
    ) {
      return (
        "🛡️ **How spoof detection works**\n\n" +
        "FaceGuard uses a two-stage analysis process:\n\n" +
        "• **Stage 1 — Texture & Screen Analysis:** checks texture, edges, frequency patterns and screen-like characteristics.\n\n" +
        "• **Stage 2 — Monocular Depth Estimation:** uses the MiDaS model to estimate depth information from the captured face.\n\n" +
        "• **Final — Data Fusion:** combines these signals to produce the final REAL or SPOOF decision."
      );
    }

    if (q.includes("real")) {
      return (
        "✅ **REAL result**\n\n" +
        "A REAL result means the current analysis found evidence consistent with an authentic face.\n\n" +
        "The confidence score shows how strongly the current analysis supports that decision."
      );
    }

    if (
      q.includes("ai service") ||
      q.includes("python") ||
      q.includes("5000")
    ) {
      return (
        "🐍 **AI Service troubleshooting**\n\n" +
        "FaceGuard's AI service runs separately from the Java backend.\n\n" +
        "Make sure the Python Flask service is running on:\n\n" +
        "**http://localhost:5000**\n\n" +
        "You can test it by opening the AI service health endpoint in your browser."
      );
    }

    if (
      q.includes("backend") ||
      q.includes("java") ||
      q.includes("8081")
    ) {
      return (
        "☕ **Java Backend troubleshooting**\n\n" +
        "The FaceGuard Spring Boot backend should be running on:\n\n" +
        "**http://localhost:8081**\n\n" +
        "If login, registration or scan history is not working, first check whether the Spring Boot application is running."
      );
    }

    if (
      q.includes("depth") ||
      q.includes("midas")
    ) {
      return (
        "🧠 **Depth Analysis**\n\n" +
        "FaceGuard uses **MiDaS monocular depth estimation** as part of Stage 2.\n\n" +
        "The model estimates relative depth structure from a single image. This depth information is then combined with texture and screen analysis during the fusion stage."
      );
    }

    if (
      q.includes("history") ||
      q.includes("scan history")
    ) {
      return (
        "📊 **Scan History**\n\n" +
        "After a successful AI analysis, FaceGuard attempts to save the result to the Java backend.\n\n" +
        "You can then open **Scan History** from the sidebar to view previous results including confidence, depth, texture and fusion scores."
      );
    }

    if (
      q.includes("how") &&
      q.includes("work")
    ) {
      return (
        "⚡ **FaceGuard architecture**\n\n" +
        "The application has three main parts:\n\n" +
        "1. React frontend — user interface and camera capture.\n\n" +
        "2. Java Spring Boot backend — authentication and scan history.\n\n" +
        "3. Python Flask AI service — image analysis and MiDaS depth estimation.\n\n" +
        "The final result is returned to the React application and stored in the backend."
      );
    }

    if (
      q.includes("confidence") ||
      q.includes("score")
    ) {
      return (
        "📈 **Understanding the scores**\n\n" +
        "**Confidence** represents the strength of the final classification.\n\n" +
        "**Depth** represents the depth-related evidence.\n\n" +
        "**Texture** represents texture analysis evidence.\n\n" +
        "**Screen** represents screen/presentation-attack related evidence.\n\n" +
        "**Fusion** represents the combined decision score."
      );
    }

    if (
      q.includes("hello") ||
      q.includes("hi") ||
      q.includes("hey")
    ) {
      return (
        "Hello! 👋\n\nI'm ready to help you with your FaceGuard project. You can ask me about the camera, AI analysis, MiDaS, spoof detection, backend, scan history or project architecture."
      );
    }

    return (
      "I can help with that. 🤖\n\n" +
      "Try asking me about:\n\n" +
      "• Camera problems\n" +
      "• REAL / SPOOF results\n" +
      "• AI service\n" +
      "• Java backend\n" +
      "• MiDaS depth estimation\n" +
      "• Scan History\n" +
      "• FaceGuard architecture"
    );
  }

  function sendMessage(customMessage) {
    const text = (customMessage || input).trim();

    if (!text || typing) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        role: "assistant",
        text: getReply(text),
      };

      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 700);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text:
          "Chat cleared. 👋 How can I help you with FaceGuard?",
      },
    ]);
  }

  function formatText(text) {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (
            part.startsWith("**") &&
            part.endsWith("**")
          ) {
            return (
              <strong key={i}>
                {part.slice(2, -2)}
              </strong>
            );
          }

          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}

        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  }

  return (
    <div className="page support-page">
      <div className="support-chat-shell">

        {/* CHAT HEADER */}

        <div className="chat-header">
          <div className="chat-header-left">
            <div className="support-ai-avatar">
              <Sparkles size={21} />
            </div>

            <div>
              <h1>FaceGuard Support</h1>

              <div className="chat-online">
                <span></span>
                AI Support Online
              </div>
            </div>
          </div>

          <button
            className="clear-chat-btn"
            onClick={clearChat}
            title="Clear conversation"
          >
            <Trash2 size={17} />
            <span>Clear</span>
          </button>
        </div>

        {/* CHAT BODY */}

        <div className="chat-body">

          {messages.length === 1 && (
            <div className="chat-welcome">

              <div className="welcome-orb">
                <Sparkles size={34} />
              </div>

              <h2>How can I help?</h2>

              <p>
                Ask anything about your FaceGuard AI
                project, scanner, backend or AI service.
              </p>

              <div className="suggestion-grid">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    className="suggestion-card"
                    onClick={() => sendMessage(item)}
                  >
                    <MessageCircle size={17} />
                    <span>{item}</span>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>

            </div>
          )}

          <div className="messages-container">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                {message.role === "assistant" && (
                  <div className="message-avatar">
                    <Sparkles size={16} />
                  </div>
                )}

                <div className="message-content">
                  <div className="message-role">
                    {message.role === "user"
                      ? "You"
                      : "FaceGuard AI"}
                  </div>

                  <div className="message-bubble">
                    {formatText(message.text)}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="user-message-avatar">
                    <User size={16} />
                  </div>
                )}

              </div>
            ))}

            {typing && (
              <div className="chat-message assistant-message">

                <div className="message-avatar">
                  <Sparkles size={16} />
                </div>

                <div className="message-content">

                  <div className="message-role">
                    FaceGuard AI
                  </div>

                  <div className="typing-bubble">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* INPUT */}

        <div className="chat-input-area">

          <div className="chat-input-box">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message FaceGuard Support..."
              rows="1"
            />

            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
            >
              <ArrowRight size={19} />
            </button>

          </div>

          <div className="chat-input-hint">
            FaceGuard Support AI can explain your project and help
            troubleshoot common issues.
          </div>

        </div>

      </div>
    </div>
  );
}

function SupportCard({ icon, title, text, to }) {
  return (
    <Link to={to} className="support-card">
      <div className="support-icon">{icon}</div>

      <h2>{title}</h2>

      <p>{text}</p>

      <span>
        Open <ArrowRight size={16} />
      </span>
    </Link>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout user={user}>{children}</Layout>;
}

/* =========================
   APP
========================= */

function App() {
  const user = getUser();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard user={getUser()} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <Scan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile user={getUser()} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/how-it-works"
        element={
          <ProtectedRoute>
            <HowItWorks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;