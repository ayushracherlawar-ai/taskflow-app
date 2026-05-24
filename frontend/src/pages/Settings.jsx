import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sun, Moon, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth }  from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm
  bg-slate-50 dark:bg-slate-900/50
  border border-slate-200 dark:border-slate-700
  text-slate-800 dark:text-slate-100
  placeholder-slate-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
  transition-all duration-150`;

const labelCls = "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

// ── Section wrapper ─────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
  >
    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-brand-500" />
      </div>
      <div>
        <h2 className="font-display font-bold text-slate-800 dark:text-white text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-6">{children}</div>
  </motion.div>
);

// ── Password field ──────────────────────────────────────────────
const PasswordField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required
          placeholder="••••••••"
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────
const Settings = () => {
  const { dark, toggleTheme } = useTheme();
  const { user }              = useAuth();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setPwLoading(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-100 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Manage your account and preferences</p>
        </div>

        {/* ── Profile info (read-only) ── */}
        <Section icon={User} title="Account" subtitle="Your profile information">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold font-display shrink-0">
              {user?.username?.slice(0, 2).toUpperCase() || "TF"}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{user?.username}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">{user?.email}</p>
            </div>
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section icon={dark ? Moon : Sun} title="Appearance" subtitle="Choose your preferred theme">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {dark ? "Dark Mode" : "Light Mode"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {dark
                  ? "Easy on the eyes at night"
                  : "Bright and clean interface"}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40
                ${dark ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-600"}`}
              style={{ width: "52px" }}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300
                  ${dark ? "translate-x-7" : "translate-x-1"}`}
              >
                {dark
                  ? <Moon size={10} className="text-brand-500" />
                  : <Sun  size={10} className="text-amber-500" />}
              </span>
            </button>
          </div>
        </Section>

        {/* ── Change password ── */}
        <Section icon={Lock} title="Change Password" subtitle="Update your account password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePwChange}
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePwChange}
            />
            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePwChange}
            />

            {/* Password strength hint */}
            {passwords.newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwords.newPassword.length >= i * 3
                          ? i <= 1 ? "bg-red-400"
                            : i <= 2 ? "bg-amber-400"
                            : i <= 3 ? "bg-blue-400"
                            : "bg-emerald-400"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {passwords.newPassword.length < 6
                    ? "Too short (min 6 chars)"
                    : passwords.newPassword.length < 9
                    ? "Moderate strength"
                    : passwords.newPassword.length < 12
                    ? "Good strength"
                    : "Strong password"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold
                shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
                transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0 mt-1"
            >
              {pwLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ShieldCheck size={15} />
              }
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </Section>

      </div>
    </div>
  );
};

export default Settings;