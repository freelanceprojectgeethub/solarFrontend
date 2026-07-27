import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  BarChart3,
  Shield,
  FileText,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Star,
  ChevronDown,
  Sparkles,
  Lock,
  Menu,
  X
} from "lucide-react";

/* ─── Framer Motion Motion Variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
};

const LandingPage = () => {
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const logos = [
    "TATA SOLAR",
    "WAAREE ENERGIES",
    "ADANI SOLAR",
    "VIKRAM SOLAR",
    "GROWATT",
    "HAVELLS SOLAR"
  ];

  const faqs = [
    {
      q: "How does the 14-day free trial work?",
      a: "You receive full access to all SolarSaaS features for 14 days. No credit card required. You can set up your company, add inventory, invite team members, and experience automated GST billing immediately."
    },
    {
      q: "Is my company data strictly isolated from other tenants?",
      a: "Yes! SolarSaaS utilizes enterprise multi-tenant architecture. Each company's data, transactions, and ledgers are securely isolated with row-level database security."
    },
    {
      q: "Does SolarSaaS automatically calculate multi-state GST?",
      a: "Yes! Based on supplier and customer GSTIN state codes, the system automatically detects whether to apply CGST + SGST (intra-state) or IGST (inter-state)."
    },
    {
      q: "Can I assign custom roles to accountants and sales reps?",
      a: "Yes. Our Role-Based Access Control (RBAC) allows you to grant accountants access strictly to financial reports while sales reps only see billing and inventory."
    }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07080e",
        color: "#f1f5f9",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* ── BACKGROUND AMBIENT LIGHTING & SUBTLE GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[500px] sm:h-[700px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.15) 50%, transparent 80%)"
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* ── STICKY GLASS NAVBAR ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(7, 8, 14, 0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "16px 24px"
        }}
      >
        <div
          style={{
            maxWidth: 1150,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #FD4B23, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)"
              }}
            >
              <Sun size={20} strokeWidth={2.2} />
            </div>
            <div className="hidden sm:flex" style={{ flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                SolarSaaS
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#34d399", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 3 }}>
                Enterprise ERP
              </span>
            </div>
          </Link>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/setup"
                style={{
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  padding: "10px 22px",
                  borderRadius: 30,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Clickable 3-line Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── CLICKABLE 3-LINE MENU DRAWER ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                maxWidth: 1150,
                margin: "0 auto",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                marginTop: 14,
                paddingTop: 20,
                paddingBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontSize: 15,
                fontWeight: 600,
                color: "#cbd5e1"
              }}
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: "#f1f5f9", textDecoration: "none", padding: "4px 0" }}>Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} style={{ color: "#f1f5f9", textDecoration: "none", padding: "4px 0" }}>Modules</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} style={{ color: "#f1f5f9", textDecoration: "none", padding: "4px 0" }}>Testimonials</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: "#f1f5f9", textDecoration: "none", padding: "4px 0" }}>Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: "#f1f5f9", textDecoration: "none", padding: "4px 0" }}>FAQ</a>
              <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: 12 }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#ffffff", fontWeight: 600, padding: "12px", textAlign: "center", borderRadius: 10, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                  Sign In
                </Link>
                <Link to="/setup" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#ffffff", fontWeight: 700, padding: "14px", textAlign: "center", borderRadius: 30, backgroundColor: "#10b981", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" }}>
                  Start 14-Day Free Trial
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN CONTAINER ── */}
      <main style={{ maxWidth: 1150, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
        
        {/* ══ HERO SECTION ══ */}
        <section style={{ padding: "80px 0 60px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Badge Pill */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeInUp}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Zap size={14} />
            <span>Built Specifically for Solar Distributors & Dealers</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeInUp}
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              maxWidth: 900,
              margin: "0 auto 20px auto"
            }}
          >
            Manage Your Solar Business{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
                marginTop: 6
              }}
            >
              With Enterprise Precision & Ease
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeInUp}
            style={{
              fontSize: 17,
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: 680,
              margin: "0 auto 36px auto"
            }}
          >
            The all-in-one multi-tenant ERP platform engineered for solar equipment distributors and dealers. Streamline purchases, sales, inventory, and multi-state GST tax compliance.
          </motion.p>

          {/* Hero Action Button */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeInUp}
            style={{ marginBottom: 32 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/setup"
                style={{
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  padding: "16px 36px",
                  borderRadius: 30,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 10px 30px rgba(16, 185, 129, 0.35)",
                  transition: "all 0.2s"
                }}
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Micro Trust Points */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeInUp}
            style={{ display: "flex", flexWrap: "wrap", items: "center", justifyCenter: "center", gap: 24, fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 56 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#34d399" />
              <span>14-day free trial</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#34d399" />
              <span>No setup fee</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#34d399" />
              <span>Full GST tax engine</span>
            </div>
          </motion.div>

          {/* ══ HERO PRODUCT SHOWCASE CARD (HIGH CONTRAST & VISIBLE) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: 960,
              backgroundColor: "#0d0f17",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 20,
              padding: "28px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              textAlign: "left"
            }}
          >
            {/* Top Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b", marginLeft: 12 }}>
                  solarsaas.app/dashboard
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "3px 12px", borderRadius: 20, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                Live Sync Active
              </span>
            </div>

            {/* KPI Stat Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: "18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Total Sales</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: "6px 0 4px 0" }}>₹42,80,500</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={13} /> +18.4% growth
                </span>
              </div>

              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: "18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Total Purchases</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: "6px 0 4px 0" }}>₹28,45,000</p>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>12 Active Suppliers</span>
              </div>

              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: "18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>GST Liability</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#34d399", margin: "6px 0 4px 0" }}>₹3,85,400</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ShieldCheck size={13} /> Auto Calculated
                </span>
              </div>
            </div>

            {/* Bar Chart */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 14, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Monthly Invoice Performance</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>2026 Q1-Q3</span>
              </div>
              <div style={{ height: 100, display: "flex", alignItems: "flex-end", gap: 10 }}>
                {[40, 65, 50, 85, 60, 95, 75, 100, 80, 110].map((val, idx) => (
                  <div key={idx} style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "4px 4px 0 0", height: "100%", display: "flex", alignItems: "flex-end" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.05 }}
                      style={{
                        width: "100%",
                        background: "linear-gradient(to top, #059669, #34d399)",
                        borderRadius: "4px 4px 0 0"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

        </section>

        {/* ══ "TRUSTED BY" LOGOS BAR ══ */}
        <section
          style={{
            backgroundColor: "#0a0c14",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "24px 32px",
            margin: "40px 0 80px 0",
            textAlign: "center"
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
            Trusted By Leading Solar Equipment Distributors & Dealers
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, alignItems: "center" }}>
            {logos.map((logo, idx) => (
              <div key={idx} style={{ padding: "10px", borderRadius: 8, backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 12, fontWeight: 800, color: "#cbd5e1" }}>
                {logo}
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES SECTION (3 COLUMN SOLID CARDS) ══ */}
        <section id="features" style={{ padding: "60px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>Core Capabilities</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginTop: 8 }}>
              Everything you need to scale your solar operations
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 540, margin: "8px auto 0 auto", lineHeight: 1.6 }}>
              Purpose-built tools designed to streamline daily transactions, financial ledgers, reporting, and team permissions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              style={{
                backgroundColor: "#0d0f18",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 20,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.25s"
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                  }}
                >
                  <BarChart3 size={24} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>
                  Smart Dashboard
                </h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                  Get real-time insights into your sales, purchases, supplier ledgers, and cash flows with instant KPI tracking.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              style={{
                backgroundColor: "#0d0f18",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 20,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.25s"
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                  }}
                >
                  <Shield size={24} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>
                  Role-Based Access
                </h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                  Control who sees what. Give your accountant access only to reports, sales reps to billing, and admins full control.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              style={{
                backgroundColor: "#0d0f18",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 20,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.25s"
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                  }}
                >
                  <FileText size={24} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>
                  Instant GST Reports
                </h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                  Auto-calculated CGST, SGST &amp; IGST reports ready for filing with state-detection based on buyer GSTIN.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ MODULES SUITE ══ */}
        <section id="modules" style={{ padding: "60px 0" }}>
          <div
            style={{
              backgroundColor: "#0a0c14",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
              padding: "40px"
            }}
          >
            <div style={{ maxWidth: 600, marginBottom: 36 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>Enterprise Modules</span>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", marginTop: 6 }}>
                Built specifically for solar panel & inverter supply chains
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div style={{ padding: "24px", borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <Package size={22} color="#34d399" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Item & Brand Master</h4>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>Manage solar panels, inverters, structures, and rating attributes.</p>
              </div>

              <div style={{ padding: "24px", borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <DollarSign size={22} color="#34d399" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Purchase & Sale Entries</h4>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>Record immediate purchases and future sales bookings.</p>
              </div>

              <div style={{ padding: "24px", borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <Users size={22} color="#34d399" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Supplier & Customer Ledgers</h4>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>Full ledger tracking, payment receipts, and aging statements.</p>
              </div>

              <div style={{ padding: "24px", borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <Layers size={22} color="#34d399" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Profit Margin Analysis</h4>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>Product-wise and brand-wise margin breakdowns.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" style={{ padding: "60px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>Customer Success</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginTop: 8 }}>
              Trusted by top solar business leaders
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
            {[
              {
                quote: "SolarSaaS completely eliminated our manual GST calculation errors. Managing 50+ dealer accounts is now effortless.",
                name: "Lalit Agrawal",
                title: "Managing Director",
                company: "Lalit Solar Energy"
              },
              {
                quote: "The role-based access allows our accountants to work on tax filings while keeping our trade pricing confidential.",
                name: "Rajesh Kumar",
                title: "CEO",
                company: "SunPower Distributors"
              },
              {
                quote: "Provisioning new tenant companies takes under a minute. The ledger and outstanding reports saved us hundreds of hours.",
                name: "Vikram Sharma",
                title: "Operations Head",
                company: "GreenVolt Solar"
              }
            ].map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                style={{
                  backgroundColor: "#0d0f18",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 20,
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 4, color: "#f59e0b", marginBottom: 16 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, italic: true, margin: "0 0 24px 0" }}>"{t.quote}"</p>
                </div>
                <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>{t.title} • <span style={{ color: "#34d399", fontWeight: 600 }}>{t.company}</span></p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══ PRICING SECTION ══ */}
        <section id="pricing" style={{ padding: "60px 0", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto 48px auto" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pricing Plans</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginTop: 8 }}>
              Flexible plans tailored for your business
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
              Start with a 14-day free trial. No credit card required.
            </p>

            {/* Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: 12, marginTop: 20, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: !billingAnnual ? "#ffffff" : "#94a3b8" }}>Monthly</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                style={{
                  width: 48,
                  height: 24,
                  borderRadius: 20,
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "#34d399",
                    transform: billingAnnual ? "translateX(24px)" : "translateX(0px)",
                    transition: "transform 0.2s"
                  }}
                />
              </button>
              <span style={{ color: billingAnnual ? "#ffffff" : "#94a3b8" }}>
                Annual <span style={{ color: "#34d399", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: 12, marginLeft: 4 }}>20% OFF</span>
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, textLeft: "left" }}>
            {/* Tier 1 */}
            <div style={{ backgroundColor: "#0d0f18", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column", justifyBetween: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Solar Dealer</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>For single-location solar dealers.</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", marginBottom: 24 }}>
                  {billingAnnual ? "₹1,599" : "₹1,999"} <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>/ mo</span>
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#cbd5e1" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Up to 5 Users</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Sales & Purchase Billing</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Basic GST Reports</li>
                </ul>
              </div>
              <Link to="/setup" style={{ textAlign: "center", backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff", fontWeight: 700, padding: "12px", borderRadius: 12, textDecoration: "none", fontSize: 13 }}>
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Tier 2 - POPULAR */}
            <div style={{ backgroundColor: "#0e131d", border: "2px solid #10b981", borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column", justifyBetween: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "#10b981", color: "#ffffff", fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "4px 14px", borderRadius: 20 }}>
                Most Popular
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Pro Distributor</h3>
                <p style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 24 }}>For growing solar distributors.</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#34d399", marginBottom: 24 }}>
                  {billingAnnual ? "₹3,999" : "₹4,999"} <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>/ mo</span>
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#f1f5f9" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Unlimited Users & Roles</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Full Multi-State GST Engine</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Profit Margin Analysis</li>
                </ul>
              </div>
              <Link to="/setup" style={{ textAlign: "center", backgroundColor: "#10b981", color: "#ffffff", fontWeight: 700, padding: "12px", borderRadius: 12, textDecoration: "none", fontSize: 13, boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" }}>
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Tier 3 */}
            <div style={{ backgroundColor: "#0d0f18", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column", justifyBetween: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Enterprise Chain</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>For multi-branch manufacturers.</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", marginBottom: 24 }}>Custom</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#cbd5e1" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Dedicated Database</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> Custom API Integrations</li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#34d399" /> 24/7 Priority SLA Support</li>
                </ul>
              </div>
              <Link to="/setup" style={{ textAlign: "center", backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff", fontWeight: 700, padding: "12px", borderRadius: 12, textDecoration: "none", fontSize: 13 }}>
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FAQ ACCORDION ══ */}
        <section id="faq" style={{ padding: "60px 0", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>FAQ</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginTop: 8 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ backgroundColor: "#0d0f18", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 16, overflow: "hidden" }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    padding: "24px",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 15,
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} color={openFaq === idx ? "#34d399" : "#94a3b8"} style={{ transition: "transform 0.2s", transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ padding: "0 24px 24px 24px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6, borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 16 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA BANNER ══ */}
        <section
          style={{
            backgroundColor: "#0a1311",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 24,
            padding: "48px 32px",
            margin: "80px 0",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Ready to transform your solar business?
            </h2>
            <p style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 28 }}>
              Join leading solar distributors across the country using SolarSaaS to automate billing, compliance, and multi-tenant management.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/setup"
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    padding: "16px 36px",
                    borderRadius: 30,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "#04050a", padding: "48px 24px", fontSize: 13, color: "#64748b" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyBetween: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #FD4B23, #10b981)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sun size={16} />
            </div>
            <span style={{ fontWeight: 800, color: "#ffffff", fontSize: 15 }}>SolarSaaS Inc.</span>
          </div>
          <p style={{ margin: 0 }}>© 2026 SolarSaaS Inc. All rights reserved. Built for Solar Distributors & Dealers.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
            <Link to="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
