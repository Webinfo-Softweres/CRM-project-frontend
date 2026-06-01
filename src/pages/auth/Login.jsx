import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap, Mail, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = typeof error === "string" ? error : null;

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      navigate("/dashboard");
    } catch {
      // Handled by authSlice
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side (Form) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 sm:p-12"
      >
        <div className="w-full max-w-[420px] flex flex-col justify-center">
          {/* Header & Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 font-bold text-xl text-slate-900 mb-10">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <Zap size={16} className="text-white fill-white/20" />
              </div>
              Zyvera
            </div>

            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Log in to your account.
            </h1>

            <p className="text-gray-500 mt-2 text-sm font-medium">
              Enter your email address and password to log in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="flex items-center bg-white rounded-2xl px-5 py-4 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
                <Mail size={18} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full ml-4 bg-transparent border-none outline-none focus:ring-0 focus:border-transparent focus:outline-none text-sm text-gray-800 font-medium placeholder-gray-400 [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.800)] transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center bg-white rounded-2xl px-5 py-4 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm relative">
                <LockKeyhole size={18} className="text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full ml-4 pr-8 bg-transparent border-none outline-none focus:ring-0 focus:border-transparent focus:outline-none text-sm text-gray-800 font-medium placeholder-gray-400 [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.800)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errorMessage && (
                <p className="text-sm font-semibold text-red-500 pl-1">
                  {errorMessage}
                </p>
              )}

              {/* Forgot Password */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 shadow-lg shadow-blue-600/30 transition-all mt-4"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="shrink-0 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  or
                </span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 border border-slate-200 rounded-2xl py-3 hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 border border-slate-200 rounded-2xl py-3 hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 5.86 4.195 10.74 9.815 11.834v-8.49H7.042v-3.344h2.773V9.52c0-2.735 1.622-4.246 4.11-4.246 1.196 0 2.447.213 2.447.213v2.69h-1.378c-1.358 0-1.782.845-1.782 1.713v2.183h3.023l-.483 3.344h-2.54v8.49C19.805 22.813 24 17.933 24 12.073z" fill="#1877F2" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">
                    Facebook
                  </span>
                </button>
              </div>
            </form>

            <p className="text-center text-sm font-medium text-slate-500 mt-10">
              Don't you have an account?{" "}
              <a href="#" className="font-bold text-blue-600 hover:underline">
                Sign Up
              </a>
            </p>
        </div>
      </motion.div>

      {/* Right Side (Branding / Visuals) */}
      <div className="hidden lg:flex w-[45%] p-4 lg:p-6">
        <div className="w-full h-full bg-blue-600 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center text-white text-center p-12 shadow-2xl">
          
          {/* Background Hexagons/Shapes */}
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/10 rounded-3xl rotate-12 backdrop-blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 border-2 border-white/10 rounded-[3rem] -rotate-12 backdrop-blur-3xl"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>

            {/* Dashboard Mockup Representation */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative w-full max-w-[450px] aspect-[4/3] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-12 z-10"
            >
              {/* Browser Header */}
              <div className="h-8 bg-white/20 border-b border-white/10 flex items-center px-4 gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
              </div>

              {/* Mockup Content */}
              <div className="w-full flex-1 p-5 flex gap-4">
                {/* Sidebar Mockup */}
                <div className="w-1/4 h-full bg-white/10 rounded-xl border border-white/5 flex flex-col gap-3 p-3">
                   <div className="w-full h-4 bg-white/20 rounded-md"></div>
                   <div className="w-2/3 h-2.5 bg-white/10 rounded-md mt-4"></div>
                   <div className="w-3/4 h-2.5 bg-white/10 rounded-md"></div>
                   <div className="w-1/2 h-2.5 bg-white/10 rounded-md"></div>
                   <div className="w-full h-2.5 bg-white/10 rounded-md"></div>
                </div>

                {/* Main Content Mockup */}
                <div className="w-3/4 h-full flex flex-col gap-4">
                  {/* Top Chart Area */}
                  <div className="h-1/2 bg-white/10 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                     <div className="w-1/3 h-3 bg-white/20 rounded-md"></div>
                     {/* Fake Chart Lines */}
                     <div className="w-full h-16 flex items-end gap-2">
                        <div className="w-1/6 h-2/6 bg-blue-300/40 rounded-t-sm"></div>
                        <div className="w-1/6 h-4/6 bg-blue-300/40 rounded-t-sm"></div>
                        <div className="w-1/6 h-3/6 bg-blue-300/40 rounded-t-sm"></div>
                        <div className="w-1/6 h-5/6 bg-blue-300/40 rounded-t-sm"></div>
                        <div className="w-1/6 h-6/6 bg-blue-300/40 rounded-t-sm"></div>
                        <div className="w-1/6 h-4/6 bg-blue-300/40 rounded-t-sm"></div>
                     </div>
                  </div>

                  {/* Bottom Stats Area */}
                  <div className="h-1/2 flex gap-4">
                    <div className="w-1/2 h-full bg-white/10 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                       <div className="w-1/2 h-2.5 bg-white/20 rounded-md"></div>
                       <div className="w-10 h-10 rounded-full bg-indigo-400/30 self-end"></div>
                    </div>
                    <div className="w-1/2 h-full bg-white/10 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                       <div className="w-1/2 h-2.5 bg-white/20 rounded-md"></div>
                       <div className="w-10 h-10 rounded-full bg-pink-400/30 self-end"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Logo Badge */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="absolute right-12 top-[40%] w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center z-20"
            >
               <Zap className="text-blue-600 fill-blue-600/20" size={32} />
            </motion.div>

            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight z-10">
              The easiest way to manage<br />your workflow.
            </h2>
            <p className="text-blue-100 font-medium text-lg z-10">
              Join the Zyvera community now!
            </p>
          </div>
      </div>
    </div>
  );
}

export default Login;
