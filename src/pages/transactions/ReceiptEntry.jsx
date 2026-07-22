import { useState, useEffect } from "react";
import { 
  Receipt, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Wallet, 
  Building2,
  TrendingUp,
  Landmark
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const ReceiptEntry = () => {
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

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
    if (!formData.customerId) {
      alert("Please select a customer.");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid receipt amount.");
      return;
    }
    if (showBankField && !formData.bankId) {
      alert("Please select a bank account for the selected payment mode.");
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
        bankId: showBankField && formData.bankId ? formData.bankId : undefined,
        referenceNo: formData.referenceNo || undefined,
        saleId: formData.saleId || undefined,
        notes: formData.notes || undefined,
      };

      await api.post("/receipts", payload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);

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
      alert(error.response?.data?.message || "Failed to save receipt voucher");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c._id === formData.customerId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">Customer Receipt Voucher recorded successfully!</span>
        </div>
      )}

      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Transactions</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Receipt Voucher</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            Record Customer Receipt Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports/receipt-register"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Receipt Register</span>
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Customer & Amount */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>1. Client & Receipt Amount</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-normal">REC-AUTO-GEN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div>
                <label className="form-label">
                  <span>Customer / B2B Client Name</span>
                  <span className="form-label-req">*</span>
                </label>
                <select
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleChange}
                  className="input-field font-medium text-sm cursor-pointer"
                >
                  <option value="">Choose Customer...</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedCustomerObj && (
                  <p className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomerObj.name} {selectedCustomerObj.gstNumber ? `• GSTIN: ${selectedCustomerObj.gstNumber}` : "• Consumer (B2C)"}</span>
                  </p>
                )}
              </div>

              {/* Receipt Amount */}
              <div>
                <label className="form-label">
                  <span>Received Amount (₹)</span>
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

          {/* Card 2: Receipt Mode & Banking */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>2. Mode of Receipt & Deposited Account</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receipt Date */}
              <div>
                <label className="form-label">
                  <span>Receipt Date</span>
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

              {/* Receipt Mode */}
              <div>
                <label className="form-label">
                  <span>Receipt Mode</span>
                  <span className="form-label-req">*</span>
                </label>
                <select
                  name="mode"
                  required
                  value={formData.mode}
                  onChange={handleChange}
                  className="input-field font-medium cursor-pointer"
                >
                  <option value="cash">Cash Collection</option>
                  <option value="bank_transfer">Direct Bank Deposit (NEFT / RTGS)</option>
                  <option value="upi">UPI / Online Transfer</option>
                  <option value="cheque">Cheque Received</option>
                </select>
              </div>

              {/* Conditional Bank Account Selector */}
              {showBankField && (
                <div>
                  <label className="form-label">
                    <span>Deposited Company Bank Account</span>
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
                  placeholder="e.g. UTR-PAYIN-987612 / CHQ-44012"
                />
              </div>
            </div>

            {/* Against Sale Invoice Dropdown */}
            <div>
              <label className="form-label">Link Against Sales Invoice (Optional)</label>
              <select
                name="saleId"
                value={formData.saleId}
                onChange={handleChange}
                className="input-field font-medium cursor-pointer"
              >
                <option value="">Direct Advance / Unlinked Receipt</option>
                {sales.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.saleNumber} — Billed Total: {formatCurrency(s.totalAmount)}
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>3. Receipt Summary</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span>Voucher Type</span>
                <span className="font-semibold text-emerald-400 uppercase tracking-wider">Credit Receipt</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider block">Net Received Amount</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCurrency(Number(formData.amount))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="text-white font-semibold">{selectedCustomerObj?.name || "Not Selected"}</span>
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
                placeholder="Receipt collection notes, customer remarks..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Recording Receipt...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Issue Receipt Voucher</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ReceiptEntry;
