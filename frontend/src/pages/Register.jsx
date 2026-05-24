import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckSquare, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const Register = () => {
  const [form,     setForm]     = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", {
        username: form.username,
        email:    form.email,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      toast.success("Account created — welcome!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = "text", placeholder }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm
          bg-slate-50 dark:bg-slate-900/50
          border border-slate-200 dark:border-slate-700
          text-slate-800 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-600
          focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
          transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f1117] flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <CheckSquare size={28} className="text-brand-500" />
          <span className="font-display text-2xl font-bold text-slate-800 dark:text-white">TaskFlow</span>
        </div>

        <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Get started — it's free.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" name="username" placeholder="johndoe" />
            <Field label="Email"    name="email"    type="email"    placeholder="you@example.com" />

            {/* Password with show/hide */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm
                    bg-slate-50 dark:bg-slate-900/50
                    border border-slate-200 dark:border-slate-700
                    text-slate-800 dark:text-slate-100
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
                    transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Field label="Confirm Password" name="confirm" type={showPass ? "text" : "password"} placeholder="Repeat password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                bg-brand-500 hover:bg-brand-600 disabled:opacity-60
                text-white py-2.5 rounded-xl text-sm font-semibold
                shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
                transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;