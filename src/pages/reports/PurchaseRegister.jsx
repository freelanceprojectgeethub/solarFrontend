import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Printer, 
  ShoppingBag, 
  DollarSign, 
  PieChart, 
  ArrowUpRight,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";
import api from "../../utils/api";

const PurchaseRegister = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/purchase", {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Purchase Register:", err);
    } finally {
      setLoading(false);
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

  // Filtered rows by local search
  const filteredData = data.filter((item) => {
    const q = searchQuery.toLowerCase();
    const pNo = (item.purchaseNumber || "").toLowerCase();
    const sup = (item.supplierId?.name || "").toLowerCase();
    return pNo.includes(q) || sup.includes(q);
  });

  // Calculate Metrics
  const totalVolume = filteredData.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalTax = filteredData.reduce((acc, i) => acc + (i.cgst || 0) + (i.sgst || 0), 0);
  const totalSubtotal = filteredData.reduce((acc, i) => acc + (i.subtotal || 0), 0);

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
            <span className="text-slate-900 font-bold">Purchase Register</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FD4B23]/10 text-[#FD4B23] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            Purchase Register Audit Log
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Purchases</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{filteredData.length} Vouchers</div>
          <p className="text-[11px] text-slate-400">Total recorded transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Gross Amount</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalVolume)}</div>
          <p className="text-[11px] text-slate-400">Net billing value (inc. GST)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Input Tax</span>
          <div className="text-xl font-bold text-emerald-600 font-mono">{formatCurrency(totalTax)}</div>
          <p className="text-[11px] text-slate-400">CGST + SGST Input Tax Credit</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Avg Ticket Value</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(filteredData.length ? totalVolume / filteredData.length : 0)}
          </div>
          <p className="text-[11px] text-slate-400">Average purchase value</p>
        </div>
      </div>

      {/* Search & Date Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PO number or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field text-xs pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-xs font-mono py-2"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-xs font-mono py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn-accent px-5 py-2.5 text-xs font-bold shadow-md shadow-[#FD4B23]/20 flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">PO Number</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-5">Vendor / Supplier</th>
                <th className="py-4 px-4 text-right">Subtotal</th>
                <th className="py-4 px-4 text-right">CGST</th>
                <th className="py-4 px-4 text-right">SGST</th>
                <th className="py-4 px-5 text-right">Total Amount</th>
                <th className="py-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#FD4B23] border-t-transparent animate-spin"></div>
                      <span>Fetching Purchase Register data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No purchase records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your date filter or search keyword.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{item.purchaseNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{formatDate(item.date)}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{item.supplierId?.name || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.cgst)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.sgst)}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                        item.status === "received" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status || "pending"}
                      </span>
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

export default PurchaseRegister;
