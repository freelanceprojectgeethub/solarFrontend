import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Package,
  Tag,
  FolderTree,
  Ruler,
  Truck,
  Users,
  Landmark,
  Percent,
  ShieldCheck,
  UserCog,
  ShoppingCart,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  Receipt,
  CalendarClock,
  LineChart,
  CreditCard,
  Wallet,
  BookOpen,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Boxes,
  Tags,
  FileCheck,
  BarChart3,
  LogOut,
  ChevronRight,
  Sun,
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  Settings,
  Menu,
  X,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navGroups = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", path: "/app", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "Masters",
      items: [
        { name: "Companies", path: "/companies", icon: Building2 },
        { name: "Items", path: "/items", icon: Package },
        { name: "Brands", path: "/brands", icon: Tag },
        { name: "Categories", path: "/categories", icon: FolderTree },
        { name: "Units", path: "/units", icon: Ruler },
        { name: "Suppliers", path: "/suppliers", icon: Truck },
        { name: "Customers", path: "/customers", icon: Users },
        { name: "Banks", path: "/banks", icon: Landmark },
        { name: "GST Rates", path: "/gst", icon: Percent },
      ],
    },
    {
      title: "Transactions",
      items: [
        { name: "Purchases", path: "/purchases", icon: ShoppingCart },
        { name: "Future Purchases", path: "/future-purchases", icon: Clock },
        { name: "Sales", path: "/sales", icon: DollarSign },
        { name: "Future Sales", path: "/future-sales", icon: TrendingUp },
        { name: "Payments", path: "/payments", icon: ArrowUpRight },
        { name: "Receipts", path: "/receipts", icon: ArrowDownLeft },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Purchase Register", path: "/reports/purchase", icon: FileSpreadsheet },
        { name: "Sales Register", path: "/reports/sales", icon: Receipt },
        { name: "Future Purchase", path: "/reports/future-purchase", icon: CalendarClock },
        { name: "Future Sales", path: "/reports/future-sales", icon: LineChart },
        { name: "Payment Register", path: "/reports/payment", icon: CreditCard },
        { name: "Receipt Register", path: "/reports/receipt", icon: Wallet },
        { name: "Supplier Ledger", path: "/reports/supplier-ledger", icon: BookOpen },
        { name: "Customer Ledger", path: "/reports/customer-ledger", icon: UserCheck },
        { name: "Outstanding Payable", path: "/reports/outstanding-payable", icon: AlertCircle },
        { name: "Outstanding Receivable", path: "/reports/outstanding-receivable", icon: CheckCircle2 },
        { name: "Product Wise", path: "/reports/product-wise", icon: Boxes },
        { name: "Brand Wise", path: "/reports/brand-wise", icon: Tags },
        { name: "GST Summary", path: "/reports/gst-summary", icon: FileCheck },
        { name: "Profit Margin", path: "/reports/profit-margin", icon: BarChart3 },
      ],
    },
    {
      title: "Settings",
      items: [
        { name: "Roles", path: "/roles", icon: ShieldCheck },
        { name: "Users", path: "/users", icon: UserCog },
      ],
    },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/super-admin/dashboard") return "Platform Dashboard";
    if (currentPath === "/super-admin/tenants") return "Manage Tenants";
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === currentPath) return item.name;
      }
    }
    if (currentPath === "/app") return "Dashboard";
    return "Solar SaaS";
  };

  const getBreadcrumbGroup = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/super-admin")) return "Super Admin";
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === currentPath) return group.title;
      }
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-[#09090c] font-sans antialiased text-gray-100 relative">
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${!sidebarOpen ? "hidden md:flex" : "flex"}`}
        style={{
          background: "linear-gradient(180deg, rgba(18,18,22,0.96) 0%, rgba(13,13,17,0.98) 100%)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: -8, background: "radial-gradient(circle, rgba(253,75,35,0.18) 0%, transparent 70%)", borderRadius: 16 }} />
              <div
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #FD4B23, #e5401e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(253,75,35,0.25)",
                }}
              >
                <Sun size={18} color="#fff" strokeWidth={2.2} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>
                Solar SaaS
              </span>
              <span style={{ fontSize: 8.5, fontWeight: 600, color: "rgba(253,75,35,0.75)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 3 }}>
                Enterprise
              </span>
            </div>
          </div>

          {/* Close Button inside Sidebar Header */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav
          className="sidebar-scroll"
          style={{
            flex: 1,
            padding: "16px 12px",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {user?.isSuperAdmin && (
              <div>
                <h2
                  style={{
                    padding: "0 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#FD4B23",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                  }}
                >
                  Super Admin
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <NavLink
                    to="/super-admin/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <LayoutDashboard size={17} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                    <span>Platform Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/super-admin/tenants"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Building2 size={17} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                    <span>Manage Tenants</span>
                  </NavLink>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "16px 10px 0 10px" }} />
              </div>
            )}
            {navGroups.map((group, idx) => (
              <div key={idx}>
                <h2
                  style={{
                    padding: "0 10px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#52525b",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                  }}
                >
                  {group.title}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {group.items.map((item) => {
                    if (item.path === "/companies" && !user?.isSuperAdmin) {
                      return null;
                    }
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? "active" : ""}`
                        }
                      >
                        <Icon size={17} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Footer */}
        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #FD4B23, #e5401e)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(253,75,35,0.25)",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", lineHeight: 1.3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(250,250,250,0.92)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || "Lalit Agrawal"}
                </span>
                <span style={{ fontSize: 10, color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.roleId?.name || "Super Admin"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "none",
                backgroundColor: "transparent",
                color: "#52525b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#52525b";
              }}
              title="Logout"
            >
              <LogOut size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Top Header Bar */}
        <header
          className="app-header"
          style={{
            height: 56,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f1f1f4",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          {/* Left: Hamburger / Toggle Button + Breadcrumb & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {getBreadcrumbGroup() && (
                <>
                  <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>
                    {getBreadcrumbGroup()}
                  </span>
                  <ChevronRight size={13} color="#d1d5db" className="hidden sm:inline" />
                </>
              )}
              <h1 style={{ fontSize: 14, fontWeight: 600, color: "#111827", letterSpacing: "-0.01em", margin: 0 }}>
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Header Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Quick Search */}
            <div style={{ position: "relative" }} className="hidden md:block">
              <Search size={14} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: 180,
                  height: 34,
                  paddingLeft: 34,
                  paddingRight: 14,
                  fontSize: 12,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  outline: "none",
                  color: "#374151",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(253,75,35,0.4)";
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(253,75,35,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Notification Icon */}
            <button
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid #f3f4f6",
                backgroundColor: "#ffffff",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.color = "#111827";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <Bell size={16} />
              <span style={{ width: 6, height: 6, backgroundColor: "#FD4B23", borderRadius: "50%", position: "absolute", top: 7, right: 7, border: "2px solid #ffffff" }} />
            </button>

            <div className="hidden sm:block" style={{ height: 20, width: 1, backgroundColor: "#e5e7eb" }} />

            {/* Company Badge */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", fontSize: 11, fontWeight: 600, color: "#374151" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
              <span>Lalit Solar</span>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: 4,
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "linear-gradient(135deg, #FD4B23, #e5401e)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 11,
                    boxShadow: "0 2px 6px rgba(253,75,35,0.25)",
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "L"}
                </div>
                <ChevronDown size={13} color="#9ca3af" style={{ transition: "transform 0.2s", transform: profileDropdown ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      right: 0,
                      marginTop: 8,
                      width: 210,
                      backgroundColor: "#ffffff",
                      borderRadius: 14,
                      boxShadow: "0 12px 30px -5px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.05)",
                      border: "1px solid #e5e7eb",
                      padding: "4px 0",
                      zIndex: 60,
                    }}
                  >
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.name || "Lalit Agrawal"}
                      </p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.email || "lalit@solar.com"}
                      </p>
                    </div>
                    <div style={{ padding: "4px 0" }}>
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          navigate("/users");
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 14px",
                          fontSize: 12,
                          color: "#374151",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <UserIcon size={14} color="#9ca3af" />
                        <span>My Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          navigate("/roles");
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 14px",
                          fontSize: 12,
                          color: "#374151",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <Settings size={14} color="#9ca3af" />
                        <span>Settings</span>
                      </button>
                    </div>
                    <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 4 }}>
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          handleLogout();
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 14px",
                          fontSize: 12,
                          color: "#ef4444",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <LogOut size={14} color="#f87171" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main
          className="app-main-content custom-scrollbar"
          style={{
            flex: 1,
            backgroundColor: "#F6F7F9",
            padding: "24px 28px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;