import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Clock,
  Search,
  Calendar,
  Printer,
  Download,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";

const FuturePurchaseReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/reports/future-purchase", {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Future Purchase Report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = searchQuery.toLowerCase();
      const oNo = (item.orderNumber || "").toLowerCase();
      const sup = (item.supplierId?.name || "").toLowerCase();
      return oNo.includes(q) || sup.includes(q);
    });
  }, [data, searchQuery]);

  const totalVolume = filteredData.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalTax = filteredData.reduce((acc, i) => acc + (i.cgst || 0) + (i.sgst || 0), 0);
  const totalSubtotal = filteredData.reduce((acc, i) => acc + (i.subtotal || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["PO Number", "Order Date", "Expected Date", "Vendor Name", "Subtotal", "GST", "Total Amount", "Status"];
    const rows = filteredData.map((d) => [
      `"${d.orderNumber || ""}"`,
      `"${formatDate(d.orderDate)}"`,
      `"${formatDate(d.expectedDate)}"`,
      `"${d.supplierId?.name || ""}"`,
      d.subtotal || 0,
      (d.cgst || 0) + (d.sgst || 0),
      d.totalAmount || 0,
      `"${d.status || "pending"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Future_Purchase_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Future Purchase PO Register
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Log of advance vendor purchase orders, supply dates, and expected procurement liabilities.
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
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Advance POs</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{filteredData.length} Orders</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Booked PO count</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Base Subtotal</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{formatCurrency(totalSubtotal)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Before estimated GST</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Estimated GST</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#d97706" }}>{formatCurrency(totalTax)}</div>
          <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>Projected tax ITC</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total PO Booking Value</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FD4B23" }}>{formatCurrency(totalVolume)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Expected payout total</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "14px 18px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 380 }}>
            <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
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
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ height: 38, padding: "0 12px", fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, outline: "none", color: "#111827" }}
            />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ height: 38, padding: "0 12px", fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, outline: "none", color: "#111827" }}
            />
          </div>

          <button
            type="submit"
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Filter size={14} />
            <span>Apply</span>
          </button>
        </form>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Future Purchases...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Retrieving booking register</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Future Purchase Records</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            No future PO bookings matched your search query or date range filters.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Order Number</th>
                  <th style={{ padding: "14px 20px" }}>Booking Date</th>
                  <th style={{ padding: "14px 20px" }}>Expected Supply Date</th>
                  <th style={{ padding: "14px 20px" }}>Vendor / Supplier</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Subtotal</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Total Amount</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {filteredData.map((item) => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                      {item.orderNumber}
                    </td>
                    <td style={{ padding: "14px 20px", color: "#6b7280" }}>
                      {formatDate(item.orderDate)}
                    </td>
                    <td style={{ padding: "14px 20px", color: "#6b7280" }}>
                      {formatDate(item.expectedDate)}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "#111827" }}>
                      {item.supplierId?.name || "N/A"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace" }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: item.status === "completed" ? "#f0fdf4" : "#fffbeb", color: item.status === "completed" ? "#16a34a" : "#d97706", border: item.status === "completed" ? "1px solid #bbf7d0" : "1px solid #fef3c7" }}>
                        {item.status || "pending"}
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

export default FuturePurchaseReport;
