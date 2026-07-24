import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Building2,
  Search,
  Printer,
  Download,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";

const OutstandingPayable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/reports/outstanding-payable");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Outstanding Payable:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      (item.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPayable = filteredData.reduce((acc, i) => acc + (i.outstanding || 0), 0);
  const totalPurchased = filteredData.reduce((acc, i) => acc + (i.totalPurchased || 0), 0);
  const totalPaid = filteredData.reduce((acc, i) => acc + (i.totalPaid || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Vendor Name", "Total Purchases (₹)", "Total Paid (₹)", "Outstanding Due (₹)"];
    const rows = filteredData.map((d) => [
      `"${d.supplierName || ""}"`,
      d.totalPurchased || 0,
      d.totalPaid || 0,
      d.outstanding || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Outstanding_Payable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="pb-10 relative">
      {/* Page Title & Top Actions Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="md:!flex-row md:!items-center md:!justify-between">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
            Outstanding Payables Aging
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Vendor payables summary, outstanding balances due, and payout settlement status.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchReport(true)}
            disabled={refreshing}
            style={{
              height: 38,
              padding: "0 14px",
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
            }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#FD4B23]" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Download size={14} color="#FD4B23" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Printer size={14} color="#6b7280" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Vendors Count</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{filteredData.length} Vendors</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>With account activity</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Purchases</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalPurchased)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Gross billed amount</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Settled</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{formatCurrency(totalPaid)}</div>
          <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>Cleared payment total</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Outstanding Due</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FD4B23" }}>{formatCurrency(totalPayable)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Net payable liability</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "14px 18px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search vendor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: 38,
              paddingLeft: 38,
              paddingRight: searchQuery ? 34 : 14,
              fontSize: 13,
              fontFamily: "'Inter', system-ui, sans-serif",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              color: "#111827",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Outstanding Payables...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Calculating vendor balances</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Outstanding Payables</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            No vendor payables found matching your search query. All accounts are settled!
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Vendor / Supplier Name</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Total Invoiced (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Total Paid (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Net Outstanding Due (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {filteredData.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                      {item.supplierName}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace" }}>
                      {formatCurrency(item.totalPurchased)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", color: "#16a34a" }}>
                      {formatCurrency(item.totalPaid)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: item.outstanding > 0 ? "#dc2626" : "#16a34a" }}>
                      {formatCurrency(item.outstanding)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: item.outstanding <= 0 ? "#f0fdf4" : "#fef2f2", color: item.outstanding <= 0 ? "#16a34a" : "#dc2626", border: item.outstanding <= 0 ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                        {item.outstanding <= 0 ? "Settled" : "Due"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutstandingPayable;
