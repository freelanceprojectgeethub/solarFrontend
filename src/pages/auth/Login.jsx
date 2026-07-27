import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import SetupPage from "./SetupPage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  AlertCircle,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";

/* ─── animation presets ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── shared input style builder ─── */
const inputStyle = (hasToggle) => ({
  width: "100%",
  height: 48,
  padding: hasToggle ? "0 44px 0 16px" : "0 16px",
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 400,
  color: "#fafafa",
  backgroundColor: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
});

const onFocus = (e) => {
  e.target.style.borderColor = "rgba(253,75,35,0.4)";
  e.target.style.boxShadow = "0 0 0 3px rgba(253,75,35,0.08)";
  e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
};
const onBlur = (e) => {
  e.target.style.borderColor = "rgba(255,255,255,0.07)";
  e.target.style.boxShadow = "none";
  e.target.style.backgroundColor = "rgba(255,255,255,0.035)";
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [isSetupDone, setIsSetupDone] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await api.get("/auth/check-setup");
        setIsSetupDone(res.data.isSetupDone);
      } catch {
        setIsSetupDone(true);
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── loading spinner ── */
  if (isSetupDone === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070a",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle opacity="0.2" cx="12" cy="12" r="10" stroke="#FD4B23" strokeWidth="3" />
            <path opacity="0.8" fill="#FD4B23" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span style={{ fontSize: 13, color: "#52525b", fontWeight: 500 }}>Loading...</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── first-time setup ── */
  if (isSetupDone === false) {
    return <SetupPage />;
  }

  const features = [
    { icon: Zap, color: "#FFCE76", label: "Real-time Analytics", desc: "Live dashboards with purchase & sales insights" },
    { icon: Shield, color: "#22c55e", label: "Role-Based Access", desc: "Enterprise RBAC with granular permissions" },
    { icon: BarChart3, color: "#FD4B23", label: "GST & Tax Compliance", desc: "Automated GSTIN tracking, state detection & summaries" },
  ];

  /* ── login page ── */
  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #07070a 0%, #0c0c10 50%, #0a0a0e 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── background ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -300, right: -250, width: 750, height: 750, background: "radial-gradient(circle, rgba(253,75,35,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -200, left: -200, width: 550, height: 550, background: "radial-gradient(circle, rgba(253,75,35,0.025) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.022,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* ── wrapper ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-wrapper"
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1060, margin: "0 auto", padding: "24px 16px" }}
      >
        {/* ── brand ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -10, background: "radial-gradient(circle, rgba(253,75,35,0.18) 0%, transparent 70%)", borderRadius: 20 }} />
            <div
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #FD4B23, #e5401e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(253,75,35,0.25)",
              }}
            >
              <Sun size={18} color="#fff" strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>Solar SaaS</span>
            <span style={{ fontSize: 8.5, fontWeight: 600, color: "rgba(253,75,35,0.7)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 2 }}>Enterprise</span>
          </div>
        </motion.div>

        {/* ── card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="auth-card"
          style={{
            position: "relative",
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(18,18,22,0.95) 0%, rgba(14,14,18,0.98) 100%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.03) inset, 0 25px 50px -12px rgba(0,0,0,0.6), 0 0 100px -30px rgba(253,75,35,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Top gradient line */}
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

          <div className="auth-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

            {/* ═══ LEFT — Brand & Features ═══ */}
            <div className="auth-left-panel" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}>
                {/* Headline */}
                <motion.h1
                  variants={fadeUp}
                  custom={0}
                  style={{
                    fontSize: "clamp(30px, 3.5vw, 42px)",
                    fontWeight: 700,
                    color: "#fafafa",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.12,
                    margin: 0,
                  }}
                >
                  The complete platform for{" "}
                  <span style={{ backgroundImage: "linear-gradient(135deg, #FD4B23 0%, #ff7847 45%, #FFCE76 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    solar business
                  </span>{" "}
                  management
                </motion.h1>

                <motion.p variants={fadeUp} custom={1} style={{ fontSize: 15, color: "#71717a", marginTop: 16, lineHeight: 1.6, maxWidth: 380 }}>
                  Manage purchases, sales, inventory, GST compliance, and financial reporting — all in one enterprise-grade platform.
                </motion.p>

                {/* Features */}
                <motion.div variants={fadeUp} custom={2} style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 0 }}>
                  {features.map((feat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <feat.icon size={16} color={feat.color} strokeWidth={1.6} />
                      </div>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(250,250,250,0.9)", display: "block" }}>{feat.label}</span>
                        <span style={{ fontSize: 12, color: "#52525b", display: "block", marginTop: 2 }}>{feat.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ fontSize: 11, color: "#27272a", marginTop: 32 }}
              >
                © {new Date().getFullYear()} Solar SaaS. All rights reserved.
              </motion.p>
            </div>

            {/* ═══ RIGHT — Login Form ═══ */}
            <div className="auth-right-panel" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}>

                {/* Mobile brand — hidden on desktop, visible on mobile */}
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="auth-mobile-brand"
                  style={{ display: "none", alignItems: "center", gap: 10, marginBottom: 32 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #FD4B23, #e5401e)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(253,75,35,0.25)",
                    }}
                  >
                    <Sun size={16} color="#fff" strokeWidth={2.2} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fafafa" }}>Solar SaaS</span>
                    <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(253,75,35,0.7)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>Enterprise</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} custom={1} style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fafafa", letterSpacing: "-0.02em", margin: 0 }}>
                    Sign in to your account
                  </h2>
                  <p style={{ fontSize: 14, color: "#52525b", marginTop: 6, lineHeight: 1.5 }}>
                    Enter your credentials to access the platform
                  </p>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginBottom: 20, overflow: "hidden" }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        backgroundColor: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.12)",
                      }}>
                        <AlertCircle size={15} color="#f87171" strokeWidth={1.8} />
                        <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                  <motion.div variants={fadeUp} custom={2} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Email */}
                    <div>
                      <label htmlFor="login-email" style={{ fontSize: 11, fontWeight: 500, color: "#71717a", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className="auth-input"
                        style={inputStyle(false)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="login-password" style={{ fontSize: 11, fontWeight: 500, color: "#71717a", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          id="login-password"
                          type={showPwd ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="auth-input"
                          style={inputStyle(true)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPwd((s) => !s)}
                          aria-label={showPwd ? "Hide password" : "Show password"}
                          className="auth-pwd-toggle"
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 44,
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#52525b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {showPwd ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={fadeUp} custom={3} style={{ marginTop: 28 }}>
                    <motion.button
                      id="login-submit"
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.008 }}
                      whileTap={{ scale: 0.992 }}
                      style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 12,
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.45 : 1,
                        background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 600,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(253,75,35,0.35)",
                        transition: "box-shadow 0.3s, opacity 0.2s",
                      }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.1) inset, 0 1px 2px rgba(0,0,0,0.2), 0 14px 32px -8px rgba(253,75,35,0.5)"; }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(253,75,35,0.35)"; }}
                    >
                      {loading ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path opacity="0.8" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <ArrowRight size={16} strokeWidth={2} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Mobile footer — hidden on desktop */}
                <p className="auth-mobile-footer" style={{ fontSize: 11, color: "#27272a", marginTop: 28, textAlign: "center", display: "none" }}>
                  © {new Date().getFullYear()} Solar SaaS. All rights reserved.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── footer ── */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ fontSize: 11, color: "#27272a", textAlign: "center", marginTop: 24 }}>
          © {new Date().getFullYear()} Solar SaaS · All rights reserved
        </motion.p>
      </motion.div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Login;
