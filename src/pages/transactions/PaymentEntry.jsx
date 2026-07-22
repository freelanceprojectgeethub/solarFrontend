import { useState, useEffect } from "react";
import api from "../../utils/api";

const PaymentEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a supplier.");
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
      alert("Payment saved successfully!");

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
      alert(error.response?.data?.message || "Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Voucher</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              name="supplierId"
              required
              value={formData.supplierId}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              required
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Payment Amount"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode *
            </label>
            <select
              name="mode"
              required
              value={formData.mode}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Bank (Conditional) */}
          {showBankField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account *
              </label>
              <select
                name="bankId"
                required={showBankField}
                value={formData.bankId}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bank</option>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bankName} - {b.accountNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reference No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference / UTR / Cheque No
            </label>
            <input
              type="text"
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ref No / UTR"
            />
          </div>

          {/* Against Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Against Purchase (Optional)
            </label>
            <select
              name="purchaseId"
              value={formData.purchaseId}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Direct Payment (No specific purchase)</option>
              {purchases.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.purchaseNumber} - Total: ₹{p.totalAmount?.toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Remarks
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Payment remarks or details..."
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentEntry;
