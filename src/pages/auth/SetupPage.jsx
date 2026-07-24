import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import {
  Sun,
  AlertCircle,
  ArrowRight,
  Check,
  Building2,
  Shield,
  Rocket,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Users,
  KeyRound,
  Receipt,
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

/* ─── reusable input component ─── */
const Field = ({ label, id, type = "text", name, value, onChange, placeholder, required = true, minLength, toggleVisible, visible, onToggle }) => (
  <div>
    <label htmlFor={id} style={{ fontSize: 11, fontWeight: 500, color: "#71717a", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={toggleVisible !== undefined ? (visible ? "text" : "password") : type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={type === "password" || toggleVisible !== undefined ? "new-password" : "off"}
        style={{
          width: "100%",
          height: 48,
          padding: toggleVisible !== undefined ? "0 44px 0 16px" : "0 16px",
          fontSize: 14,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 400,
          color: "#fafafa",
          backgroundColor: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(253,75,35,0.4)";
          e.target.style.boxShadow = "0 0 0 3px rgba(253,75,35,0.08)";
          e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.07)";
          e.target.style.boxShadow = "none";
          e.target.style.backgroundColor = "rgba(255,255,255,0.035)";
        }}
      />
      {toggleVisible !== undefined && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: 2,
            cursor: "pointer",
            color: "#52525b",
            display: "flex",
            alignItems: "center",
          }}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
        </button>
      )}
    </div>
  </div>
);

/* ─── main component ─── */
const SetupPage = () => {
  const [formData, setFormData] = useState({ companyName: "", name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await api.post("/auth/setup", payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: Building2, label: "Organization", desc: "Create company workspace" },
    { icon: Shield, label: "Super Admin", desc: "Full administrative access" },
    { icon: Rocket, label: "Ready to Launch", desc: "Everything configured automatically" },
  ];

  const badges = [
    { icon: Fingerprint, text: "256-bit Encryption" },
    { icon: Globe, text: "Enterprise Ready" },
    { icon: Users, text: "Multi Tenant" },
    { icon: KeyRound, text: "Role Based Access" },
    { icon: Receipt, text: "GST Ready" },
  ];

  if (!ready) return null;

  return (
    <div
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
        {/* Radial glows */}
        <div style={{ position: "absolute", top: -300, right: -250, width: 750, height: 750, background: "radial-gradient(circle, rgba(253,75,35,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -200, left: -200, width: 550, height: 550, background: "radial-gradient(circle, rgba(253,75,35,0.025) 0%, transparent 70%)", borderRadius: "50%" }} />
        {/* Grid */}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }} className="lg:!grid-cols-2">

            {/* ═══ LEFT ═══ */}
            <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "none" }} className="lg:!border-r lg:!border-r-[rgba(255,255,255,0.04)] max-lg:!border-b max-lg:!border-b-[rgba(255,255,255,0.04)]">
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}>
                {/* Heading */}
                <motion.h1
                  variants={fadeUp}
                  custom={0}
                  style={{
                    fontSize: "clamp(32px, 4vw, 44px)",
                    fontWeight: 700,
                    color: "#fafafa",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Initialize Your<br />
                  <span style={{ backgroundImage: "linear-gradient(135deg, #FD4B23 0%, #ff7847 45%, #FFCE76 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Solar Platform
                  </span>
                </motion.h1>

                <motion.p variants={fadeUp} custom={1} style={{ fontSize: 15, color: "#71717a", marginTop: 14, lineHeight: 1.6, maxWidth: 340 }}>
                  Configure your organization in less than one minute.
                </motion.p>

                {/* Steps */}
                <motion.div variants={fadeUp} custom={2} style={{ marginTop: 40, display: "flex", flexDirection: "column", position: "relative" }}>
                  {/* Connector */}
                  <div style={{ position: "absolute", left: 16, top: 36, width: 1, height: "calc(100% - 72px)", background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }} />

                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", position: "relative" }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          position: "relative",
                          zIndex: 1,
                          transition: "background-color 0.3s, border-color 0.3s",
                        }}
                      >
                        <step.icon size={15} color="#71717a" strokeWidth={1.6} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(250,250,250,0.9)", letterSpacing: "-0.01em" }}>{step.label}</span>
                          <Check size={13} color="#22c55e" strokeWidth={2.5} style={{ opacity: 0.5 }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#52525b", marginTop: 2, display: "block" }}>{step.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
                  {badges.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <b.icon size={11} color="#3f3f46" strokeWidth={1.6} />
                      <span style={{ fontSize: 10, color: "#3f3f46", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═══ RIGHT ═══ */}
            <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}>

                <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 19, fontWeight: 600, color: "#fafafa", letterSpacing: "-0.02em", margin: 0 }}>
                    Create Administrator Account
                  </h2>
                  <p style={{ fontSize: 13, color: "#52525b", marginTop: 6, lineHeight: 1.5 }}>
                    This account will manage your entire organization.
                  </p>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginBottom: 16, overflow: "hidden" }}
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
                  <motion.div variants={fadeUp} custom={1} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field id="setup-company" label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Lalit Solar Pvt Ltd" />
                    <Field id="setup-name" label="Admin Name" name="name" value={formData.name} onChange={handleChange} placeholder="Lalit Agrawal" />
                    <Field id="setup-email" label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="admin@company.com" />
                    <Field id="setup-password" label="Password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" minLength={6} toggleVisible visible={showPwd} onToggle={() => setShowPwd((s) => !s)} />
                    <Field id="setup-confirm" label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" minLength={6} toggleVisible visible={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
                  </motion.div>

                  <motion.div variants={fadeUp} custom={2} style={{ marginTop: 28 }}>
                    <motion.button
                      id="setup-submit"
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
                          <span>Initializing...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Setup</span>
                          <ArrowRight size={16} strokeWidth={2} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                <motion.p variants={fadeUp} custom={3} style={{ fontSize: 11, color: "#3f3f46", marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
                  Your data is encrypted end-to-end. This setup runs only once.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── footer ── */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ fontSize: 11, color: "#27272a", textAlign: "center", marginTop: 24 }}>
          © {new Date().getFullYear()} Solar SaaS · All rights reserved
        </motion.p>
      </motion.div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default SetupPage;
