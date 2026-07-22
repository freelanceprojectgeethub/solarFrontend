import { useState, useEffect } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  Landmark,
  BadgeIndianRupee
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const PaymentEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    mode: "cash",
    bankId: "",
    referenceNo: "",
    purchaseId: "",
    notes: "",
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [supRes, bankRes, purRes] = await Promise.all([
          api.get("/suppliers?limit=1000"),
          api.get("/banks?limit=1000"),
          api.get("/purchases?limit=1000"),
        ]);
        setSuppliers(supRes.data.data || []);
        setBanks(bankRes.data.data || []);
        setPurchases(purRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch master data for payment voucher:", err);
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a vendor / supplier.");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    if (showBankField && !formData.bankId) {
      alert("Please select a bank account for the selected payment mode.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        voucherNumber: `PAY-${Date.now()}`,
        supplierId: formData.supplierId,
        amount: Number(formData.amount),
        date: formData.date,
        mode: formData.mode,
        bankId: showBankField && formData.bankId ? formData.bankId : undefined,
        referenceNo: formData.referenceNo || undefined,
        purchaseId: formData.purchaseId || undefined,
        notes: formData.notes || undefined,
      };

      await api.post("/payments", payload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);

      setFormData({
        supplierId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        mode: "cash",
        bankId: "",
        referenceNo: "",
        purchaseId: "",
        notes: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save payment voucher");
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplierObj = suppliers.find((s) => s._id === formData.supplierId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">Payment Voucher recorded successfully!</span>
        </div>
      )}

      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            Record Vendor Payment Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports/payment-register"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Payment Register</span>
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voucher Form Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Vendor & Amount */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>1. Vendor & Payment Amount</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-normal">PAY-AUTO-GEN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier */}
              <div>
                <label className="form-label">
                  <span>Vendor / Supplier Name</span>
                  <span className="form-label-req">*</span>
                </label>
                <select
                  name="supplierId"
                  required
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="input-field font-medium text-sm cursor-pointer"
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {selectedSupplierObj && (
                  <p className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedSupplierObj.name} {selectedSupplierObj.gstNumber ? `• GSTIN: ${selectedSupplierObj.gstNumber}` : ""}</span>
                  </p>
                )}
              </div>

              {/* Payment Amount */}
              <div>
                <label className="form-label">
                  <span>Payment Amount (₹)</span>
                  <span className="form-label-req">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input-field font-mono font-bold text-sm pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Mode & Banking */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>2. Mode of Payment & Account Routing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Date */}
              <div>
                <label className="form-label">
                  <span>Payment Date</span>
                  <span className="form-label-req">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field font-mono"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="form-label">
                  <span>Payment Mode</span>
                  <span className="form-label-req">*</span>
                </label>
                <select
                  name="mode"
                  required
                  value={formData.mode}
                  onChange={handleChange}
                  className="input-field font-medium cursor-pointer"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="cheque">Cheque Deposit</option>
                </select>
              </div>

              {/* Conditional Bank Account Selector */}
              {showBankField && (
                <div>
                  <label className="form-label">
                    <span>Source Bank Account</span>
                    <span className="form-label-req">*</span>
                  </label>
                  <select
                    name="bankId"
                    required={showBankField}
                    value={formData.bankId}
                    onChange={handleChange}
                    className="input-field font-medium cursor-pointer"
                  >
                    <option value="">Select Company Bank Account...</option>
                    {banks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} — A/C: {b.accountNumber} ({b.branch})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* UTR / Cheque Ref No */}
              <div>
                <label className="form-label">Reference No / UTR / Cheque No</label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleChange}
                  className="input-field font-mono uppercase text-xs tracking-wider"
                  placeholder="e.g. UTR1234987654 / CHQ-000182"
                />
              </div>
            </div>

            {/* Against Purchase Dropdown */}
            <div>
              <label className="form-label">Link Against Purchase Order (Optional)</label>
              <select
                name="purchaseId"
                value={formData.purchaseId}
                onChange={handleChange}
                className="input-field font-medium cursor-pointer"
              >
                <option value="">Direct Vendor Payment (Unlinked Account Voucher)</option>
                {purchases.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.purchaseNumber} — Billed Total: {formatCurrency(p.totalAmount)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Voucher Summary & Submit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>3. Payment Preview</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span>Voucher Type</span>
                <span className="font-semibold text-blue-400 uppercase tracking-wider">Debit Payment</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider block">Net Payment Value</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCurrency(Number(formData.amount))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span>Payee:</span>
                  <span className="text-white font-semibold">{selectedSupplierObj?.name || "Not Selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="text-white font-semibold uppercase">{formData.mode.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="form-label">Notes & Internal Memo</label>
              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className="input-field text-xs"
                placeholder="Payment confirmation notes, transaction ID remarks..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent bg-blue-600 hover:bg-blue-700 py-3.5 text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Issue Payment Voucher</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PaymentEntry;
