import { useState, useEffect } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  CheckCircle2,
  FileText,
  UserCheck,
  Wallet,
  Building2,
  TrendingUp,
  Landmark,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const ReceiptEntry = () => {
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    mode: "cash",
    bankId: "",
    referenceNo: "",
    saleId: "",
    notes: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [custRes, bankRes, saleRes] = await Promise.all([
          api.get("/customers?limit=1000"),
          api.get("/banks?limit=1000"),
          api.get("/sales?limit=1000"),
        ]);
        setCustomers(custRes.data.data || []);
        setBanks(bankRes.data.data || []);
        setSales(saleRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch master data for receipt voucher:", err);
        showToast("Failed to load customers or banks", "error");
      }
    };
    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showBankField =
    formData.mode === "bank_transfer" ||
    formData.mode === "upi" ||
    formData.mode === "cheque";

  const selectedCustomerObj = customers.find((c) => c._id === formData.customerId);
  const filteredSales = sales.filter((s) => {
    if (!formData.customerId) return true;
    const custId = s.customerId?._id || s.customerId;
    return custId === formData.customerId;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      showToast("Please select a customer client", "error");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast("Please enter a valid receipt amount", "error");
      return;
    }
    if (showBankField && !formData.bankId) {
      showToast("Please select a deposit bank account", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        voucherNumber: `REC-${Date.now()}`,
        customerId: formData.customerId,
        amount: Number(formData.amount),
        date: formData.date,
        mode: formData.mode,
        bankId: showBankField ? formData.bankId : undefined,
        referenceNo: formData.referenceNo || undefined,
        saleId: formData.saleId || undefined,
        notes: formData.notes,
      };

      await api.post("/receipts", payload);
      showToast("Receipt Voucher generated successfully!");

      setFormData({
        customerId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        mode: "cash",
        bankId: "",
        referenceNo: "",
        saleId: "",
        notes: "",
      });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to record receipt voucher", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="pb-10 relative">
      {/* Toast Notification Floating Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 14,
              backgroundColor: toast.type === "error" ? "rgba(239,68,68,0.95)" : "rgba(18,18,22,0.95)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
              border: toast.type === "error" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(253,75,35,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            {toast.type === "error" ? (
              <XCircle size={18} color="#ffffff" />
            ) : (
              <CheckCircle2 size={18} color="#FD4B23" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Top Actions Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="md:!flex-row md:!items-center md:!justify-between">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
            Record Customer Receipt
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Issue money receipts, record client collections, and clear outstanding sales receivables.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to="/reports/receipt"
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
          >
            <FileText size={14} color="#6b7280" />
            <span>Receipt Register</span>
          </Link>
        </div>
      </div>

      {/* Main Entry Form Card */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 12, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FD4B23" }} />
              <span>Customer Receipt Voucher Details</span>
            </div>
            <span style={{ fontFamily: "monospace", color: "#9ca3af" }}>REC-AUTO-GEN</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {/* Customer */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Customer Client <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="customerId"
                required
                value={formData.customerId}
                onChange={handleChange}
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
                <option value="">Select Customer Client...</option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust._id}>
                    {cust.name} {cust.gstNumber ? `(GST: ${cust.gstNumber})` : ""}
                  </option>
                ))}
              </select>
              {selectedCustomerObj && (
                <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500, marginTop: 4 }}>
                  Contact: {selectedCustomerObj.phone || selectedCustomerObj.email || "No direct phone"}
                </div>
              )}
            </div>

            {/* Receipt Amount */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Received Amount (₹) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                step="0.01"
                placeholder="Amount ₹"
                value={formData.amount}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: 42,
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  outline: "none",
                  color: "#111827",
                }}
              />
            </div>

            {/* Receipt Date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Receipt Date <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
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
                }}
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Payment Collection Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
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
                  cursor: "pointer",
                }}
              >
                <option value="cash">Cash Collection</option>
                <option value="bank_transfer">Direct Deposit (NEFT/RTGS/IMPS)</option>
                <option value="upi">UPI Collection</option>
                <option value="cheque">Cheque Deposit</option>
              </select>
            </div>

            {/* Bank Selector (Conditional) */}
            {showBankField && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Deposit Bank Account <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="bankId"
                  required
                  value={formData.bankId}
                  onChange={handleChange}
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
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select Deposit Bank...</option>
                  {banks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bankName} - A/C: {b.accountNumber} ({b.ifscCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reference Number */}
            {showBankField && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  UTR / Reference / Cheque No.
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  placeholder="e.g. UTR9832049823"
                  value={formData.referenceNo}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    height: 42,
                    padding: "0 14px",
                    fontSize: 13,
                    fontFamily: "monospace",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    outline: "none",
                    color: "#111827",
                  }}
                />
              </div>
            )}

            {/* Link Sales Invoice */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Link Sales Invoice (Optional)
              </label>
              <select
                name="saleId"
                value={formData.saleId}
                onChange={handleChange}
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
                  cursor: "pointer",
                }}
              >
                <option value="">General Receipt (Unlinked / On Account)</option>
                {filteredSales.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.invoiceNumber || s._id} - Date: {new Date(s.date || s.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Voucher Remarks / Notes
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Collection notes, advance payment reference..."
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                outline: "none",
                color: "#111827",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 44,
                padding: "0 28px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "0 4px 14px rgba(253,75,35,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{loading ? "Processing..." : "Generate Receipt Voucher"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReceiptEntry;
