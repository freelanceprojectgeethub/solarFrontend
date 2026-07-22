import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Percent, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight
} from "lucide-react";
import api from "../../utils/api";

const GstSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/gst-summary");
        setData(res.data.data || null);
      } catch (err) {
        console.error("Failed to fetch GST Summary:", err);
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

  const handlePrint = () => {
    window.print();
  };

  const totalCgst = data?.totalCgst || 0;
  const totalSgst = data?.totalSgst || 0;
  const totalIgst = data?.totalIgst || 0;
  const totalGst = data?.totalGST || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Reports</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">GST Summary</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            GST Tax Liability & Summary Breakdown
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print GST Summary</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
            <span>Calculating GST liabilities...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* CGST */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 relative overflow-hidden">
              <div className="w-1.5 h-full bg-blue-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total CGST</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Central Tax</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(totalCgst)}</div>
              <p className="text-[11px] text-slate-400">Central Goods & Services Tax</p>
            </div>

            {/* SGST */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 relative overflow-hidden">
              <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total SGST</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">State Tax</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(totalSgst)}</div>
              <p className="text-[11px] text-slate-400">State Goods & Services Tax</p>
            </div>

            {/* IGST */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 relative overflow-hidden">
              <div className="w-1.5 h-full bg-purple-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total IGST</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600">Integrated</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(totalIgst)}</div>
              <p className="text-[11px] text-slate-400">Integrated Goods & Services Tax</p>
            </div>

            {/* Total GST */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 relative overflow-hidden">
              <div className="w-1.5 h-full bg-orange-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Net Total GST</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 font-mono">GSTR-3B</span>
              </div>
              <div className="text-2xl font-bold font-mono text-orange-600">{formatCurrency(totalGst)}</div>
              <p className="text-[11px] text-slate-400">Combined total tax liability</p>
            </div>
          </div>

          {/* Tax Compliance Info Card */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">GST Compliance Status</span>
              <h3 className="text-base font-bold">Automated GSTR-1 & GSTR-3B Tax Ledger</h3>
              <p className="text-xs text-slate-400">All calculations reflect CGST/SGST/IGST tax collected on sales invoices minus tax paid on procurement.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center min-w-[200px]">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Net Payable Tax</span>
              <span className="text-xl font-bold font-mono text-orange-400">{formatCurrency(totalGst)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstSummary;
