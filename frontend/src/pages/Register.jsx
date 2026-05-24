import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const Register = () => {
  const [form,     setForm]     = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", {
        username: form.username, email: form.email, password: form.password,
      });
      login(res.data.token, res.data.user);
      toast.success("Account created — welcome! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0d0f18] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Task<span className="text-gradient">Flow</span>
          </span>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-8 shadow-glass-dark">
          <h1 className="font-display text-xl font-bold text-white mb-1">Create account</h1>
          <p className="text-sm text-slate-400 mb-6">Get started — it's free.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Username", field: "username", type: "text",  placeholder: "johndoe"         },
              { label: "Email",    field: "email",    type: "email", placeholder: "you@example.com" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="label text-slate-400">{label}</label>
                <input type={type} value={form[field]} onChange={set(field)} required placeholder={placeholder}
                  className="input-field bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-brand-500" />
              </div>
            ))}

            {["Password", "Confirm Password"].map((lbl, idx) => (
              <div key={lbl}>
                <label className="label text-slate-400">{lbl}</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"}
                    value={idx === 0 ? form.password : form.confirm}
                    onChange={idx === 0 ? set("password") : set("confirm")}
                    required placeholder="••••••••"
                    className="input-field bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-brand-500 pr-10" />
                  {idx === 0 && (
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus size={16} />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 TaskFlow. All Rights Reserved by{" "}
          <span className="text-brand-500">Ayush Racherlawar</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;