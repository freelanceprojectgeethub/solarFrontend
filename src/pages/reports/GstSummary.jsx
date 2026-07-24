import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Percent,
  Printer,
  Download,
  RefreshCw,
  ShieldCheck,
  Building2,
} from "lucide-react";

const GstSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/reports/gst-summary");
      setData(res.data.data || null);
    } catch (err) {
      console.error("Failed to fetch GST Summary:", err);
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

  const handlePrint = () => {
    window.print();
  };

  const totalCgst = data?.totalCgst || 0;
  const totalSgst = data?.totalSgst || 0;
  const totalIgst = data?.totalIgst || 0;
  const totalGst = data?.totalGST || 0;

  const exportToCSV = () => {
    if (!data) return;
    const headers = ["Tax Type", "Tax Category", "Amount (₹)"];
    const rows = [
      ["CGST", "Central Goods & Services Tax", totalCgst],
      ["SGST", "State Goods & Services Tax", totalSgst],
      ["IGST", "Integrated Goods & Services Tax", totalIgst],
      ["Total GST Liability", "Net Tax Combined", totalGst],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `GST_Tax_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
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
            GST Tax Summary & Compliance
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Calculated tax liability breakdown across CGST, SGST, and IGST for GSTR-1 & GSTR-3B filings.
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
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Percent size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Calculating GST Liabilities...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Aggregating CGST, SGST, IGST returns</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main 4 KPI Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "20px", border: "1px solid #e5e7eb", borderLeft: "4px solid #2563eb" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total CGST (Central Tax)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalCgst)}</div>
              <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>Central Goods & Services Tax</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "20px", border: "1px solid #e5e7eb", borderLeft: "4px solid #16a34a" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total SGST (State Tax)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalSgst)}</div>
              <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>State Goods & Services Tax</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "20px", border: "1px solid #e5e7eb", borderLeft: "4px solid #9333ea" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total IGST (Integrated Tax)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalIgst)}</div>
              <div style={{ fontSize: 11, color: "#9333ea", marginTop: 2 }}>Integrated Goods & Services Tax</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Combined Net GST Liability</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FD4B23" }}>{formatCurrency(totalGst)}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Total tax collected minus ITC</div>
            </div>
          </div>

          {/* Compliance Card */}
          <div style={{ backgroundColor: "#111113", borderRadius: 20, border: "1px solid rgba(253,75,35,0.2)", padding: "24px 28px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.15)", color: "#FD4B23", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.08em" }}>GST Tax Compliance Ready</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "2px 0 0 0" }}>Automated GSTR-1 & GSTR-3B Calculations</h3>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0 0" }}>
                  All figures dynamically aggregate tax collected on customer sales minus tax credit paid on vendor purchases.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: "#1a1a1e", padding: "14px 22px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", minWidth: 200 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>Net Tax Payable</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#FD4B23", fontFamily: "monospace" }}>{formatCurrency(totalGst)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstSummary;
