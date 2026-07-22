import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  Calendar, 
  Printer, 
  Filter,
  CheckCircle2,
  Building2
} from "lucide-react";
import api from "../../utils/api";

const PaymentRegister = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/payment", {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Payment Register:", err);
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
    const vNo = (item.voucherNumber || "").toLowerCase();
    const sup = (item.supplierId?.name || "").toLowerCase();
    const ref = (item.referenceNo || "").toLowerCase();
    return vNo.includes(q) || sup.includes(q) || ref.includes(q);
  });

  const totalDisbursed = filteredData.reduce((acc, i) => acc + (i.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            Vendor Payment Register Log
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Disbursed</span>
          <div className="text-xl font-bold text-blue-600 font-mono">{formatCurrency(totalDisbursed)}</div>
          <p className="text-[11px] text-slate-400">Total vendor payments issued</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Payment Vouchers</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{filteredData.length} Vouchers</div>
          <p className="text-[11px] text-slate-400">Total processed payment entries</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Average Payment</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(filteredData.length ? totalDisbursed / filteredData.length : 0)}
          </div>
          <p className="text-[11px] text-slate-400">Average voucher amount</p>
        </div>
      </div>

      {/* Search & Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search voucher, vendor or UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field text-xs pl-10 block w-full rounded-lg border-slate-200 py-2.5 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-xs font-mono py-2 rounded-lg border-slate-200"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-xs font-mono py-2 rounded-lg border-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Voucher No</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-5">Supplier / Vendor</th>
                <th className="py-4 px-4 text-center">Payment Mode</th>
                <th className="py-4 px-4 font-mono">Ref / UTR No</th>
                <th className="py-4 px-5 text-right">Disbursed Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      <span>Fetching Payment Register records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No payment vouchers found</p>
                      <p className="text-xs text-slate-400">Try adjusting your date range or search keyword.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{item.voucherNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{formatDate(item.date)}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{item.supplierId?.name || "N/A"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 capitalize font-mono">
                        {(item.mode || "cash").replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 uppercase">{item.referenceNo || "-"}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount)}
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

export default PaymentRegister;
