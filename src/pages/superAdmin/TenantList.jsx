import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { Building2, Search, RefreshCw, X, ShieldCheck } from "lucide-react";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchTenants = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/super-admin/tenants");
      setTenants(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleStatus = async (company) => {
    const isCurrentlyActive = company.status !== "inactive";
    const newStatus = isCurrentlyActive ? "inactive" : "active";
    const confirmMessage = `Are you sure you want to ${isCurrentlyActive ? "suspend" : "activate"} ${company.name}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await api.put(`/super-admin/tenants/${company._id}/status`, { status: newStatus });
        fetchTenants(true);
      } catch (error) {
        console.error("Failed to update tenant status:", error);
        alert(error.response?.data?.message || "Failed to update tenant status");
      }
    }
  };

  const handleRenewSubscription = async (company) => {
    try {
      await api.put(`/super-admin/tenants/${company._id}/renew`, { days: 30 });
      fetchTenants(true);
    } catch (error) {
      console.error("Failed to renew subscription:", error);
      alert(error.response?.data?.message || "Failed to renew subscription");
    }
  };

  const filteredTenants = useMemo(() => {
    let result = [...tenants];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.gstNumber && t.gstNumber.toLowerCase().includes(q))
      );
    }
    return result;
  }, [tenants, search]);

  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTenants.slice(start, start + limit);
  }, [filteredTenants, page, limit]);

  const totalPages = Math.ceil(filteredTenants.length / limit) || 1;

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatExpiryDate = (d) => {
    if (!d) return "N/A";
    const dateObj = new Date(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const checkIsExpired = (d) => {
    if (!d) return false;
    return new Date() > new Date(d);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="pb-10">
      {/* Title & Top Action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
            Manage Tenants
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Overview of registered tenant organizations, users count, and subscription status.
          </p>
        </div>

        <button
          onClick={() => fetchTenants(true)}
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

      {/* Filter / Search bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "14px 18px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search tenant name, email or GST..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: 38,
              paddingLeft: 38,
              paddingRight: search ? 34 : 14,
              fontSize: 13,
              fontFamily: "'Inter', system-ui, sans-serif",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              color: "#111827",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          {tenants.length} Total Tenant Companies
        </span>
      </div>

      {/* Table Section */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.08)", color: "#4f46e5", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Tenants...</h3>
        </div>
      ) : paginatedTenants.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <Building2 size={32} color="#9ca3af" style={{ margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Tenants Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>No companies registered in the platform matching query.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Company Name</th>
                  <th style={{ padding: "14px 20px" }}>Email</th>
                  <th style={{ padding: "14px 20px" }}>Phone</th>
                  <th style={{ padding: "14px 20px" }}>GST Number</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>User Count</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Expiry Date</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Created Date</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedTenants.map((company) => {
                  const expired = checkIsExpired(company.subscriptionExpiry);
                  return (
                    <tr
                      key={company._id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        backgroundColor: expired ? "rgba(254,242,242,0.6)" : "transparent",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = expired ? "#fef2f2" : "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = expired ? "rgba(254,242,242,0.6)" : "transparent")}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Building2 size={16} />
                          </div>
                          <span style={{ fontWeight: 700, color: "#111827" }}>{company.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#6b7280" }}>{company.email || "N/A"}</td>
                      <td style={{ padding: "14px 20px", color: "#6b7280" }}>{company.phone || "N/A"}</td>
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#374151" }}>
                        {company.gstNumber || "N/A"}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                          {company.userCount || 0} Users
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 20,
                            backgroundColor: company.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                            color: company.status === "inactive" ? "#dc2626" : "#16a34a",
                            border: company.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                          }}
                        >
                          {company.status || "active"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center", fontFamily: "monospace", fontSize: 12, fontWeight: expired ? 700 : 500, color: expired ? "#dc2626" : "#374151" }}>
                        {formatExpiryDate(company.subscriptionExpiry)}
                        {expired && <span style={{ display: "block", fontSize: 10, color: "#dc2626", fontWeight: 700 }}>Expired</span>}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center", color: "#6b7280", fontSize: 12 }}>
                        {formatDate(company.createdAt)}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() => handleRenewSubscription(company)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: "1px solid #bfdbfe",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              transition: "all 0.2s",
                            }}
                          >
                            Renew (+30d)
                          </button>
                          <button
                            onClick={() => handleToggleStatus(company)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              backgroundColor: company.status === "inactive" ? "#16a34a" : "#dc2626",
                              color: "#ffffff",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                              transition: "all 0.2s",
                            }}
                          >
                            {company.status === "inactive" ? "Activate" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "12px 18px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
          Showing {paginatedTenants.length} of {filteredTenants.length} tenants (Page {page} of {totalPages})
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            Previous
          </button>

          <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", padding: "0 8px" }}>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
              opacity: page === totalPages || totalPages === 0 ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantList;
