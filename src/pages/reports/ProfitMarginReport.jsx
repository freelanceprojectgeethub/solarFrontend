import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Printer, 
  DollarSign, 
  PieChart
} from "lucide-react";
import api from "../../utils/api";

const ProfitMarginReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/profit-margin");
        setData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch Profit Margin Report:", err);
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
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSales = filteredData.reduce((acc, i) => acc + (i.totalSaleAmount || 0), 0);
  const totalCost = filteredData.reduce((acc, i) => acc + (i.totalCost || 0), 0);
  const totalProfit = filteredData.reduce((acc, i) => acc + (i.profit || 0), 0);
  const overallMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : 0;

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
            <span className="text-slate-900 font-bold">Profit Margin Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            Item Profit Margin & Profitability Metrics
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Profitability Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Billed Revenue</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalSales)}</div>
          <p className="text-[11px] text-slate-400">Total gross item sales</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Cost of Goods</span>
          <div className="text-xl font-bold text-slate-700 font-mono">{formatCurrency(totalCost)}</div>
          <p className="text-[11px] text-slate-400">Procurement cost basis</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Net Gross Profit</span>
          <div className="text-xl font-bold text-emerald-600 font-mono">{formatCurrency(totalProfit)}</div>
          <p className="text-[11px] text-slate-400">Total net profit earnings</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Overall Profit Margin</span>
          <div className="text-xl font-bold text-blue-600 font-mono">{overallMargin}%</div>
          <p className="text-[11px] text-slate-400">Average margin return</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item catalog..."
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
                <th className="py-4 px-5">Item Catalog Name</th>
                <th className="py-4 px-4 text-center">Units Sold</th>
                <th className="py-4 px-4 text-right">Sales Revenue (₹)</th>
                <th className="py-4 px-4 text-right">Cost (₹)</th>
                <th className="py-4 px-5 text-right">Profit (₹)</th>
                <th className="py-4 px-4 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
                      <span>Calculating profit margins...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No profit margin data found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{item.totalQuantity}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">{formatCurrency(item.totalSaleAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.totalCost)}</td>
                    <td className={`py-3.5 px-5 text-right font-mono font-bold ${
                      (item.profit || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {formatCurrency(item.profit)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-lg ${
                        (item.margin || 0) >= 20
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : (item.margin || 0) >= 0
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.margin || 0}%
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

export default ProfitMarginReport;
