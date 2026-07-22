import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sun, Mail, Lock, AlertCircle, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] flex relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FD4B23]/[0.04] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFCE76]/[0.03] rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FD4B23]/[0.015] rounded-full blur-[150px]"></div>
      </div>

      {/* Left Panel — Brand & Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-16 relative z-10">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD4B23] to-[#FF8A5C] flex items-center justify-center shadow-lg shadow-[#FD4B23]/20">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-white tracking-tight">Solar SaaS</span>
              <span className="text-[9px] font-bold text-[#FD4B23] tracking-[0.15em] uppercase">Enterprise</span>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              The complete platform for
              <span className="bg-gradient-to-r from-[#FD4B23] to-[#FFCE76] bg-clip-text text-transparent"> solar business </span>
              management
            </h1>
            <p className="text-gray-400 text-base mt-5 leading-relaxed max-w-md">
              Manage purchases, sales, inventory, GST compliance, and financial reporting — all in one enterprise-grade platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-4 mt-12">
            <div className="flex items-center gap-3.5 text-gray-300">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-[#FFCE76]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Real-time Analytics</span>
                <p className="text-xs text-gray-500 mt-0.5">Live dashboards with purchase & sales insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 text-gray-300">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Role-Based Access</span>
                <p className="text-xs text-gray-500 mt-0.5">Enterprise RBAC with granular permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 text-gray-300">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-[#FD4B23]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">GST & Tax Compliance</span>
                <p className="text-xs text-gray-500 mt-0.5">Automated GSTIN tracking, state detection & summaries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Solar SaaS. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FD4B23] to-[#FF8A5C] flex items-center justify-center shadow-lg shadow-[#FD4B23]/20">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white tracking-tight">Solar SaaS</span>
              <span className="text-[8px] font-bold text-[#FD4B23] tracking-[0.15em] uppercase">Enterprise</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mt-1.5">Enter your credentials to access the platform</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-5 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FD4B23]/50 focus:ring-1 focus:ring-[#FD4B23]/20 focus:bg-white/[0.08] transition-all font-medium"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FD4B23]/50 focus:ring-1 focus:ring-[#FD4B23]/20 focus:bg-white/[0.08] transition-all font-medium"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#FD4B23] text-white font-semibold text-sm hover:bg-[#E5401E] shadow-lg shadow-[#FD4B23]/25 hover:shadow-[#FD4B23]/40 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mobile footer */}
          <p className="text-gray-600 text-xs mt-8 text-center lg:hidden">
            © {new Date().getFullYear()} Solar SaaS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
