import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  ShoppingCart,
  DollarSign,
  Users,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  Zap,
  PieChart,
  Building2,
  FileSpreadsheet,
  Activity,
} from "lucide-react";

const formatCurrency = (amount) =>
  `₹${(amount ?? 0).toLocaleString("en-IN")}`;

const calcBarWidth = (value, max) => {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
};

const SectionHeader = ({ icon: Icon, title, description, action }) => (
  <div className="dashboard-section-head">
    <div className="dashboard-section-head-left">
      <div className="dashboard-section-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="dashboard-section-title">{title}</h3>
        {description && <p className="dashboard-section-desc">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => {
        setData(res.data.data || res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayName = user?.name || "User";
  const firstName = displayName.split(" ")[0];
  const companyName = user?.companyId?.name || user?.company?.name || "Your Company";
  const roleName = user?.roleId?.name || user?.role?.name || "Admin";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="dashboard-page animate-fade-in">
        <div className="dashboard-hero h-52 animate-pulse bg-dark-light" />
        <div className="dashboard-section">
          <div className="dashboard-section-head h-20 animate-pulse bg-page-bg" />
          <div className="dashboard-section-body">
            <div className="dashboard-kpi-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dashboard-kpi h-36 animate-pulse bg-page-bg" />
              ))}
            </div>
          </div>
        </div>
        <div className="dashboard-section h-64 animate-pulse bg-surface" />
        <div className="dashboard-analytics-grid">
          <div className="dashboard-section h-80 animate-pulse" />
          <div className="dashboard-section h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  const totalSalesAmount = data?.sales?.totalSalesAmount ?? data?.totalSalesAmount ?? 0;
  const totalSalesCount = data?.sales?.totalSalesCount ?? data?.totalSalesCount ?? 0;
  const totalPurchaseAmount = data?.purchases?.totalPurchaseAmount ?? data?.totalPurchaseAmount ?? 0;
  const totalPurchaseCount = data?.purchases?.totalPurchaseCount ?? data?.totalPurchaseCount ?? 0;
  const totalReceiptAmount = data?.receipts?.totalReceiptAmount ?? data?.totalReceiptAmount ?? 0;
  const totalPaymentAmount = data?.payments?.totalPaymentAmount ?? data?.totalPaymentAmount ?? 0;

  const netCashFlow = totalReceiptAmount - totalPaymentAmount;
  const grossMargin = totalSalesAmount - totalPurchaseAmount;

  const flowMax = Math.max(
    totalSalesAmount,
    totalPurchaseAmount,
    totalReceiptAmount,
    totalPaymentAmount,
    1
  );

  const stats = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSalesAmount),
      meta: `${totalSalesCount} invoices recorded`,
      tag: "Revenue",
      tagClass: "badge-accent",
      icon: TrendingUp,
      iconBg: "bg-accent-light text-accent",
      variant: "dashboard-kpi-accent",
    },
    {
      label: "Total Purchases",
      value: formatCurrency(totalPurchaseAmount),
      meta: `${totalPurchaseCount} bills processed`,
      tag: "Expense",
      tagClass: "bg-secondary-light text-dark border border-secondary/30",
      icon: TrendingDown,
      iconBg: "bg-secondary-light text-dark",
      variant: "dashboard-kpi-secondary",
    },
    {
      label: "Total Receipts",
      value: formatCurrency(totalReceiptAmount),
      meta: "Collections from customers",
      tag: "Inflow",
      tagClass: "badge-success",
      icon: ArrowDownCircle,
      iconBg: "bg-success-light text-success",
      variant: "dashboard-kpi-success",
    },
    {
      label: "Total Payments",
      value: formatCurrency(totalPaymentAmount),
      meta: "Disbursements to vendors",
      tag: "Outflow",
      tagClass: "bg-accent-light text-accent border border-accent/15",
      icon: ArrowUpCircle,
      iconBg: "bg-accent-light text-accent-hover",
      variant: "dashboard-kpi-dark",
    },
  ];

  const quickActions = [
    {
      title: "New Sale",
      desc: "Create and issue invoice",
      path: "/sales",
      icon: DollarSign,
      iconBg: "bg-accent-light text-accent",
    },
    {
      title: "New Purchase",
      desc: "Record supplier bill",
      path: "/purchases",
      icon: ShoppingCart,
      iconBg: "bg-secondary-light text-dark",
    },
    {
      title: "Payment",
      desc: "Pay vendor outstanding",
      path: "/payments",
      icon: ArrowUpRight,
      iconBg: "bg-accent-light text-accent",
    },
    {
      title: "Receipt",
      desc: "Record customer payment",
      path: "/receipts",
      icon: ArrowDownLeft,
      iconBg: "bg-success-light text-success",
    },
    {
      title: "Customer",
      desc: "Register new customer",
      path: "/customers",
      icon: Users,
      iconBg: "bg-secondary-light text-dark",
    },
    {
      title: "Supplier",
      desc: "Register new supplier",
      path: "/suppliers",
      icon: Truck,
      iconBg: "bg-accent-light text-accent",
    },
  ];

  const cashFlowItems = [
    {
      label: "Sales Revenue",
      amount: totalSalesAmount,
      dotColor: "bg-accent",
      fillClass: "bg-accent",
    },
    {
      label: "Purchase Cost",
      amount: totalPurchaseAmount,
      dotColor: "bg-dark-light",
      fillClass: "bg-dark-light",
    },
    {
      label: "Receipts Received",
      amount: totalReceiptAmount,
      dotColor: "bg-success",
      fillClass: "bg-success",
    },
    {
      label: "Payments Made",
      amount: totalPaymentAmount,
      dotColor: "bg-secondary",
      fillClass: "bg-secondary",
    },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      {/* ── Section 1: Executive Overview ── */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="space-y-5 max-w-2xl">
              <div>
                <p className="text-sm font-medium text-white/50 flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" />
                  {today}
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-white tracking-tight leading-tight">
                  Good day, {firstName}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/sales")}
                  className="btn-accent"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
                <button
                  onClick={() => navigate("/reports/sales")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white/90 bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  View Reports
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:min-w-[340px]">
              <div className="dashboard-hero-metric">
                <p className="dashboard-hero-metric-label">Net Cash Flow</p>
                <p
                  className={`dashboard-hero-metric-value ${
                    netCashFlow >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {formatCurrency(netCashFlow)}
                </p>
              </div>
              <div className="dashboard-hero-metric">
                <p className="dashboard-hero-metric-label">Gross Margin</p>
                <p className="dashboard-hero-metric-value">
                  {formatCurrency(grossMargin)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Key Performance Indicators ── */}
      <section className="dashboard-section">
        <SectionHeader
          icon={Activity}
          title="Key Performance Indicators"
          description="Core financial metrics across your business operations"
          action={
            <span className="dashboard-chip">
              <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
              All time data
            </span>
          }
        />
        <div className="dashboard-section-body">
          <div className="dashboard-kpi-grid">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`dashboard-kpi ${stat.variant} animate-fade-in stagger-${idx + 1}`}
                  style={{ opacity: 0 }}
                >
                  <div className="dashboard-kpi-top">
                    <p className="dashboard-kpi-label">{stat.label}</p>
                    <div className={`dashboard-kpi-icon ${stat.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="dashboard-kpi-value">{stat.value}</p>
                  <div className="dashboard-kpi-footer">
                    <span className="dashboard-kpi-meta">{stat.meta}</span>
                    <span className={`dashboard-kpi-tag ${stat.tagClass}`}>
                      {stat.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Quick Workflows ── */}
      <section className="dashboard-section">
        <SectionHeader
          icon={Zap}
          title="Quick Workflows"
          description="Launch common tasks and transaction entries instantly"
        />
        <div className="dashboard-section-body">
          <div className="dashboard-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="dashboard-action-tile"
                >
                  <span className="dashboard-action-tile-arrow">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <div className={`dashboard-action-tile-icon ${action.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="dashboard-action-tile-title">{action.title}</p>
                    <p className="dashboard-action-tile-desc">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Analytics & Insights ── */}
      <div className="dashboard-analytics-grid">
        {/* Financial Overview */}
        <section className="dashboard-section">
          <SectionHeader
            icon={BarChart3}
            title="Financial Overview"
            description="Comparative analysis of revenue, costs, and cash movement"
            action={
              <span className="dashboard-chip">
                <PieChart className="w-3.5 h-3.5 text-accent" />
                Relative scale
              </span>
            }
          />
          <div className="dashboard-section-body">
            {cashFlowItems.map((item) => {
              const pct = calcBarWidth(item.amount, flowMax);
              return (
                <div key={item.label} className="dashboard-flow-row">
                  <div className="dashboard-flow-header">
                    <div className="dashboard-flow-label-wrap">
                      <span className={`dashboard-flow-dot ${item.dotColor}`} />
                      <span className="dashboard-flow-label">{item.label}</span>
                    </div>
                    <span className="dashboard-flow-amount">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div
                      className={`dashboard-progress-fill ${item.fillClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="dashboard-flow-percent">{pct}% of peak metric</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Business Insights */}
        <section className="dashboard-section flex flex-col">
          <SectionHeader
            icon={Building2}
            title="Business Insights"
            description="Account summary and derived financial indicators"
          />
          <div className="dashboard-section-body flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="dashboard-insight">
                <div className="dashboard-insight-head">
                  <div className="dashboard-insight-icon bg-success-light text-success">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="dashboard-insight-label">Net Cash Position</span>
                </div>
                <p
                  className={`dashboard-insight-value ${
                    netCashFlow >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {formatCurrency(netCashFlow)}
                </p>
                <p className="dashboard-insight-desc">
                  Total receipts minus total payments
                </p>
              </div>

              <div className="dashboard-insight">
                <div className="dashboard-insight-head">
                  <div className="dashboard-insight-icon bg-accent-light text-accent">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="dashboard-insight-label">Gross Margin</span>
                </div>
                <p
                  className={`dashboard-insight-value ${
                    grossMargin >= 0 ? "text-text-primary" : "text-danger"
                  }`}
                >
                  {formatCurrency(grossMargin)}
                </p>
                <p className="dashboard-insight-desc">
                  Sales revenue minus purchase costs
                </p>
              </div>

              <div className="dashboard-account-card">
                <div className="dashboard-account-row">
                  <span className="dashboard-account-label">Organization</span>
                  <span className="dashboard-account-value text-accent">
                    {companyName}
                  </span>
                </div>
                <div className="dashboard-account-row">
                  <span className="dashboard-account-label">Access Level</span>
                  <span className="dashboard-account-value">{roleName}</span>
                </div>
                <div className="dashboard-account-row">
                  <span className="dashboard-account-label">Signed in as</span>
                  <span className="dashboard-account-value">{displayName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/reports/sales")}
              className="dashboard-reports-btn"
            >
              Open Sales Register
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
