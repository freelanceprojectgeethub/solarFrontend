import { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Printer, 
  ArrowUpRight, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import api from "../../utils/api";

const OutstandingPayable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/outstanding-payable");
        setData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch Outstanding Payable:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const filteredData = data.filter((item) =>
    (item.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayable = filteredData.reduce((acc, i) => acc + (i.outstanding || 0), 0);
  const totalPurchased = filteredData.reduce((acc, i) => acc + (i.totalPurchased || 0), 0);
  const totalPaid = filteredData.reduce((acc, i) => acc + (i.totalPaid || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            Vendor Accounts Payable Summary
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Outstanding Payable</span>
          <div className="text-xl font-bold text-amber-600 font-mono">{formatCurrency(totalPayable)}</div>
          <p className="text-[11px] text-slate-400">Total unpaid supplier balance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Purchased Billed</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalPurchased)}</div>
          <p className="text-[11px] text-slate-400">Lifetime purchase volume</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Payments Cleared</span>
          <div className="text-xl font-bold text-emerald-600 font-mono">{formatCurrency(totalPaid)}</div>
          <p className="text-[11px] text-slate-400">Settled vendor payments</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-10"
          />
        </div>
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Supplier / Vendor Name</th>
                <th className="py-4 px-5 text-right">Total Purchased (₹)</th>
                <th className="py-4 px-5 text-right">Total Paid (₹)</th>
                <th className="py-4 px-5 text-right">Outstanding Payable (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                      <span>Fetching Payables statement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="font-semibold text-slate-700">No outstanding payables</p>
                      <p className="text-xs text-slate-400">All vendor accounts are fully settled!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{item.supplierName}</td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-600">{formatCurrency(item.totalPurchased)}</td>
                    <td className="py-3.5 px-5 text-right font-mono text-emerald-600 font-semibold">{formatCurrency(item.totalPaid)}</td>
                    <td className={`py-3.5 px-5 text-right font-mono font-bold ${
                      item.outstanding > 0 ? "text-amber-600" : "text-slate-900"
                    }`}>
                      {formatCurrency(item.outstanding)}
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

export default OutstandingPayable;
