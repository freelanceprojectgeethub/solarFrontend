import { useState, useEffect } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { Building2, Users, UserCheck, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

const SuperAdminDashboard = () => {
  const [data, setData] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    expiredSubscriptions: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/super-admin/dashboard");
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch super admin dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="pb-10">
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 8px", borderRadius: 6, backgroundColor: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, border: "1px solid #bfdbfe" }}>
              PLATFORM OVERVIEW
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
            Platform Administration
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Cross-tenant system analytics, tenant metrics, and platform user activity.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          style={{
            height: 38,
            padding: "0 16px",
            borderRadius: 10,
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            color: "#374151",
            fontSize: 12,
            fontWeight: 600,
            cursor: refreshing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-[#FD4B23]" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.08)", color: "#4f46e5", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Platform Metrics...</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {/* Card 1: Total Companies */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 22,
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #2563eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Companies
              </span>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 6 }}>
                {data.totalCompanies ?? 0}
              </div>
              <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, marginTop: 4, display: "inline-block" }}>
                Tenants Registered
              </span>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={24} />
            </div>
          </motion.div>

          {/* Card 2: Active Companies */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.04 }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 22,
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #059669",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Companies
              </span>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 6 }}>
                {data.activeCompanies ?? 0}
              </div>
              <span style={{ fontSize: 12, color: "#059669", fontWeight: 500, marginTop: 4, display: "inline-block" }}>
                Active Status Tenants
              </span>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={24} />
            </div>
          </motion.div>

          {/* Card 3: Expired Subscriptions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.08 }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 22,
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #dc2626",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Expired Subscriptions
              </span>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 6 }}>
                {data.expiredSubscriptions ?? 0}
              </div>
              <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 4, display: "inline-block" }}>
                Requires Renewal
              </span>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={24} />
            </div>
          </motion.div>

          {/* Card 4: Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.12 }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 22,
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #16a34a",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Users
              </span>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 6 }}>
                {data.totalUsers ?? 0}
              </div>
              <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500, marginTop: 4, display: "inline-block" }}>
                Across All Tenants
              </span>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={24} />
            </div>
          </motion.div>

          {/* Card 5: Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.16 }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 22,
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #9333ea",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Users
              </span>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 6 }}>
                {data.activeUsers ?? 0}
              </div>
              <span style={{ fontSize: 12, color: "#9333ea", fontWeight: 500, marginTop: 4, display: "inline-block" }}>
                Active Accounts
              </span>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={24} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
