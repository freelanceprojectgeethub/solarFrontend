import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  Search,
  Printer,
  Download,
  RefreshCw,
  X,
  PieChart,
} from "lucide-react";

const ProfitMarginReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/reports/profit-margin");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Profit Margin Report:", err);
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
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalSales = filteredData.reduce((acc, i) => acc + (i.totalSaleAmount || 0), 0);
  const totalCost = filteredData.reduce((acc, i) => acc + (i.totalCost || 0), 0);
  const totalProfit = filteredData.reduce((acc, i) => acc + (i.profit || 0), 0);
  const overallMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : 0;

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Product Item", "Units Sold", "Total Revenue (₹)", "Cost Price Total (₹)", "Gross Profit (₹)", "Profit Margin %"];
    const rows = filteredData.map((d) => [
      `"${d.name || ""}"`,
      d.totalQuantity || 0,
      d.totalSaleAmount || 0,
      d.totalCost || 0,
      d.profit || 0,
      `"${d.margin || 0}%"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Profit_Margin_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Profit Margin Analysis
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Itemized product profitability margins, sales cost vs revenue, and net ROI contribution.
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
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Sales Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalSales)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Gross revenue generated</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Cost of Goods (COGS)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#6b7280" }}>{formatCurrency(totalCost)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Total procurement cost</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Net Gross Profit</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{formatCurrency(totalProfit)}</div>
          <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>Net margin after cost</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Overall Profit Margin</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FD4B23" }}>{overallMargin}%</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Average return percentage</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "14px 18px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search product item..."
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
            <TrendingUp size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Profit Analysis...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Calculating item margins</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PieChart size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Product Records</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            No products matched your search query.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Product Item</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Units Sold</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Total Revenue (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Cost Price Total (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Gross Profit (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Margin %</th>
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
                      {item.name}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center", fontWeight: 600 }}>
                      {item.totalQuantity}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                      {formatCurrency(item.totalSaleAmount)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", color: "#6b7280" }}>
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: item.profit >= 0 ? "#16a34a" : "#dc2626" }}>
                      {formatCurrency(item.profit)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: Number(item.margin) >= 15 ? "#f0fdf4" : Number(item.margin) > 0 ? "#fffbeb" : "#fef2f2", color: Number(item.margin) >= 15 ? "#16a34a" : Number(item.margin) > 0 ? "#d97706" : "#dc2626" }}>
                        {item.margin}%
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

export default ProfitMarginReport;
