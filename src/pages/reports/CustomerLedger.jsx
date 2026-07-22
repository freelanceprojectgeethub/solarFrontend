import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Search, 
  Printer, 
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import api from "../../utils/api";

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [data, setData] = useState([]);
  const [closingBalance, setClosingBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers?limit=1000");
        setCustomers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  const fetchLedger = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/reports/customer-ledger", {
        params: { customerId: selectedCustomer },
      });
      setData(res.data.data || []);
      setClosingBalance(res.data.closingBalance ?? 0);
    } catch (err) {
      console.error("Failed to fetch Customer Ledger:", err);
    } finally {
      setLoading(false);
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
      year: "numeric"
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const selectedCustomerObj = customers.find((c) => c._id === selectedCustomer);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Reports</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Customer Ledger</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            Customer Statement & Running Ledger
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Customer Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <form onSubmit={handleShowLedger} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="form-label">
              <span>Choose Client / Customer</span>
              <span className="form-label-req">*</span>
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="input-field font-medium cursor-pointer"
            >
              <option value="">Choose Customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-accent bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Generate Account Ledger</span>
          </button>
        </form>

        {selectedCustomerObj && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm block">{selectedCustomerObj.name}</span>
              <span className="text-slate-500">Phone: {selectedCustomerObj.phone || "N/A"} • GSTIN: {selectedCustomerObj.gstNumber || "Consumer (B2C)"}</span>
            </div>
            {closingBalance !== null && (
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Closing Receivables Balance</span>
                <span className={`text-base font-bold font-mono ${closingBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(closingBalance)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-4">Transaction Type</th>
                <th className="py-4 px-5">Voucher Reference</th>
                <th className="py-4 px-4 text-right">Credit (₹)</th>
                <th className="py-4 px-4 text-right">Debit (₹)</th>
                <th className="py-4 px-5 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
                      <span>Fetching Customer Ledger statement...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No ledger entries found</p>
                      <p className="text-xs text-slate-400">Select a customer above and click "Generate Account Ledger".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-600">{formatDate(item.date)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                        item.type === "sale"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{item.reference || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-red-600">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;
