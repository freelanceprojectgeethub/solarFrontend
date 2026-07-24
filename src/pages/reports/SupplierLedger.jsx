import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Building2,
  Search,
  Printer,
  Download,
  Filter,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";

const SupplierLedger = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [data, setData] = useState([]);
  const [closingBalance, setClosingBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get("/suppliers?limit=1000");
        setSuppliers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const fetchLedger = async (silent = false) => {
    if (!selectedSupplier) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/reports/supplier-ledger", {
        params: { supplierId: selectedSupplier },
      });
      setData(res.data.data || []);
      setClosingBalance(res.data.closingBalance ?? 0);
    } catch (err) {
      console.error("Failed to fetch Supplier Ledger:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShowLedger = (e) => {
    e.preventDefault();
    fetchLedger();
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

  const selectedSupplierObj = suppliers.find((s) => s._id === selectedSupplier);

  const totalDebit = useMemo(() => data.reduce((acc, i) => acc + (i.debit || 0), 0), [data]);
  const totalCredit = useMemo(() => data.reduce((acc, i) => acc + (i.credit || 0), 0), [data]);

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = ["Date", "Voucher No / Particulars", "Type", "Debit (₹)", "Credit (₹)", "Balance (₹)"];
    const rows = data.map((d) => [
      `"${formatDate(d.date)}"`,
      `"${d.particulars || d.voucherNo || ""}"`,
      `"${d.type || ""}"`,
      d.debit || 0,
      d.credit || 0,
      d.balance || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Supplier_Ledger_${selectedSupplierObj?.name || "Report"}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Supplier Ledger Statement
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Itemized vendor account ledger, purchase debits, payment credits, and running balance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {selectedSupplier && (
            <>
              <button
                onClick={() => fetchLedger(true)}
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
                <span>Print Statement</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Supplier Selector Control Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
        <form onSubmit={handleShowLedger} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Select Vendor / Supplier Account <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              style={{
                width: "100%",
                height: 42,
                padding: "0 14px",
                fontSize: 13,
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                outline: "none",
                color: "#111827",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="">Choose Supplier...</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.name} {sup.gstNumber ? `(GST: ${sup.gstNumber})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ alignSelf: "flex-end" }}>
            <button
              type="submit"
              disabled={!selectedSupplier}
              style={{
                height: 42,
                padding: "0 22px",
                borderRadius: 10,
                border: "none",
                background: selectedSupplier ? "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)" : "#e5e7eb",
                color: selectedSupplier ? "#ffffff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: selectedSupplier ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Filter size={15} />
              <span>Generate Statement</span>
            </button>
          </div>
        </form>
      </div>

      {/* KPI Stats Panel (When Selected) */}
      {selectedSupplier && closingBalance !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Purchases (Debit)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626" }}>{formatCurrency(totalDebit)}</div>
            <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>Invoiced billing amount</div>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Payments (Credit)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{formatCurrency(totalCredit)}</div>
            <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>Disbursed payment total</div>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Net Closing Balance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: closingBalance > 0 ? "#FD4B23" : "#22c55e" }}>{formatCurrency(Math.abs(closingBalance))} {closingBalance > 0 ? "Payable" : "Advance"}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Current account position</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!selectedSupplier ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Select a Vendor Account</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 0 auto", lineHeight: 1.5 }}>
            Choose a supplier from the dropdown above to load their itemized ledger statement.
          </p>
        </div>
      ) : loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Ledger Statement...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Calculating running balances</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Ledger Entries</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 0 auto", lineHeight: 1.5 }}>
            No purchase or payment transactions recorded for <span style={{ fontWeight: 700, color: "#111827" }}>{selectedSupplierObj?.name}</span> yet.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Date</th>
                  <th style={{ padding: "14px 20px" }}>Particulars / Voucher No</th>
                  <th style={{ padding: "14px 20px" }}>Type</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Debit (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Credit (₹)</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {data.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", color: "#6b7280" }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "#111827" }}>
                      {item.particulars || item.voucherNo || "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: item.debit > 0 ? "#fef2f2" : "#f0fdf4", color: item.debit > 0 ? "#dc2626" : "#16a34a", textTransform: "uppercase" }}>
                        {item.type || (item.debit > 0 ? "Purchase" : "Payment")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", color: item.debit > 0 ? "#dc2626" : "#9ca3af", fontWeight: item.debit > 0 ? 700 : 400 }}>
                      {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", color: item.credit > 0 ? "#16a34a" : "#9ca3af", fontWeight: item.credit > 0 ? 700 : 400 }}>
                      {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                      {formatCurrency(item.balance)}
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

export default SupplierLedger;
