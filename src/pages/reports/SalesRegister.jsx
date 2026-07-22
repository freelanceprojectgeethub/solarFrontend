import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Calendar, 
  Printer, 
  Receipt, 
  Filter,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import api from "../../utils/api";

const SalesRegister = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/sales", {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Sales Register:", err);
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

  const filteredData = data.filter((item) => {
    const q = searchQuery.toLowerCase();
    const sNo = (item.saleNumber || "").toLowerCase();
    const cust = (item.customerId?.name || "").toLowerCase();
    return sNo.includes(q) || cust.includes(q);
  });

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
            <span className="text-slate-900 font-bold">Sales Register</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            Sales Tax Invoice Register
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Invoices Billed</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{filteredData.length} Invoices</div>
          <p className="text-[11px] text-slate-400">Total customer sales entries</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Gross Sales Revenue</span>
          <div className="text-xl font-bold text-emerald-600 font-mono">{formatCurrency(totalVolume)}</div>
          <p className="text-[11px] text-slate-400">Total billed revenue (inc. GST)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Output GST Tax</span>
          <div className="text-xl font-bold text-blue-600 font-mono">{formatCurrency(totalTax)}</div>
          <p className="text-[11px] text-slate-400">CGST + SGST tax liability</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Avg Invoice Value</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(filteredData.length ? totalVolume / filteredData.length : 0)}
          </div>
          <p className="text-[11px] text-slate-400">Average sales per invoice</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice number or customer..."
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
              className="btn-accent bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
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
                <th className="py-4 px-5">Invoice No</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-5">Customer Name</th>
                <th className="py-4 px-4 text-right">Subtotal</th>
                <th className="py-4 px-4 text-right">CGST</th>
                <th className="py-4 px-4 text-right">SGST</th>
                <th className="py-4 px-5 text-right">Total Invoice</th>
                <th className="py-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      <span>Fetching Sales Register data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No sales invoices found</p>
                      <p className="text-xs text-slate-400">Try adjusting your date filter or search keyword.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{item.saleNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{formatDate(item.date)}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{item.customerId?.name || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.cgst)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.sgst)}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600">{formatCurrency(item.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                        item.status === "paid" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : item.status === "partially_paid"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.status || "unpaid"}
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

export default SalesRegister;
