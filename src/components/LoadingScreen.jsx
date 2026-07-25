import { motion, AnimatePresence } from "framer-motion";
import { Sun } from "lucide-react";
import { useLoading } from "../context/LoadingContext";

const LoadingScreen = () => {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(circle at 50% 45%, rgba(253, 75, 35, 0.12) 0%, rgba(9, 9, 11, 0.98) 70%)",
            backdropFilter: "blur(12px)",
            userSelect: "none",
          }}
        >
          {/* Subtle grid background overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.15,
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />

          {/* Central Logo Container */}
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: "out" }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Pulsing Radial Aura behind logo */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.35, 0.7, 0.35],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: 24,
                  background: "radial-gradient(circle, rgba(253,75,35,0.4) 0%, rgba(253,75,35,0) 75%)",
                  filter: "blur(8px)",
                }}
              />

              {/* Logo Badge */}
              <div
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 35px rgba(253, 75, 35, 0.35), 0 2px 8px rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Sun size={38} color="#ffffff" strokeWidth={2.2} />
                </motion.div>
              </div>
            </div>

            {/* Company Branding */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <motion.h1
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#fafafa",
                  letterSpacing: "-0.03em",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                }}
              >
                Solar SaaS
              </motion.h1>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(253, 75, 35, 0.9)",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginTop: 6,
                  backgroundColor: "rgba(253, 75, 35, 0.1)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px solid rgba(253, 75, 35, 0.25)",
                }}
              >
                Enterprise System
              </motion.span>
            </div>

            {/* Loading Bar & Message */}
            <div style={{ width: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              {/* Progress Line */}
              <div
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <motion.div
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "50%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, transparent, #FD4B23, #ff7e5f, transparent)",
                  }}
                />
              </div>

              {/* Status Message */}
              <motion.span
                key={loadingMessage}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#a1a1aa",
                  letterSpacing: "0.01em",
                }}
              >
                {loadingMessage || "Initializing workspace..."}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
