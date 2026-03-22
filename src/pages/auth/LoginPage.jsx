import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Leaf,
} from "lucide-react";
import logoImg from "../../assets/Parivartan_Logo.png";
import { BASE_URL } from "../../constants/config";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("crm@eparivartan.com");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Simple validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = emailRegex.test(email) && password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful!");
        onLogin(data);
      } else {
        const errorMsg = data.message || "Invalid Email or Password";
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch {
      toast.error("Server error. Please try again.");
      setError("Server error. Please try again.");
    }

    setIsLoading(false);
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-slate-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md md:max-w-[420px] lg:max-w-md mx-auto animate-fade-in relative z-10 flex flex-col items-center justify-center h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
          {!imgError ? (
            <img
              src={logoImg}
              alt="Logo"
              className="w-40 md:w-56 lg:w-72 h-auto object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-14 h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
              <Leaf
                size={32}
                className="md:w-10 md:h-10 lg:w-14 lg:h-14"
                fill="currentColor"
              />
            </div>
          )}
          {/* <div className="flex flex-col border-l-2 border-primary/10 pl-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary tracking-tighter leading-none">
              Parivartan
            </h1>
            <p className="text-[12px] md:text-xs lg:text-sm font-bold text-slate-500  tracking-[0.4em] mt-1">
              CRM Portal
            </p>
          </div> */}
        </div>

        {/* Login Card */}
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200 w-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/20">
          <div className="mb-3 md:mb-4 lg:mb-6 text-center">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tighter">
              Welcome Back
            </h2>
            <p className="text-[12px] md:text-xs lg:text-sm text-textMuted font-bold  tracking-widest mt-1">
              Please sign in to your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 md:space-y-3 lg:space-y-4"
          >
            <div className="space-y-1">
              <label className="text-[14px] md:text-[12px] font-bold text-[#18254D]  tracking-[0.2em] ml-2">
                Email ID
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#18254D] transition-colors"
                />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 lg:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-[#18254D]/20 focus:border-[#18254D] transition-all font-medium placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@parivartan.crm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[14px] md:text-[12px] font-bold text-[#18254D]  tracking-[0.2em] ml-2">
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#18254D] transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3 md:py-3.5 lg:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-[#18254D]/20 focus:border-[#18254D] transition-all font-medium placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#18254D] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 md:p-4 bg-error/5 border border-error/10 rounded-xl flex items-center gap-3 text-error animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[14px] font-bold tracking-tight leading-tight ">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 md:py-3.5 lg:py-4 rounded-xl md:rounded-xl lg:rounded-xl font-bold text-[13px] lg:text-sm  tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-[0.97] ${
                isFormValid && !isLoading
                  ? "bg-[#18254D] text-white hover:bg-[#62a33a] hover:scale-[1.02] hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 md:mb-2 text-[12px] lg:text-xs font-bold text-slate-400  tracking-widest opacity-60">
          © Copyright 2026 Parivartan. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
