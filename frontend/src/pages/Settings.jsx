import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Palette, Bell, Shield, Database,
  Sun, Moon, Eye, EyeOff, ShieldCheck,
  Download, Trash2, LogOut, CheckCircle2,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth }  from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

// ── Section card ────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
  >
    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-brand-500" />
      </div>
      <div>
        <h2 className="font-display font-bold text-slate-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-6">{children}</div>
  </motion.div>
);

// ── Toggle row ──────────────────────────────────────────────────
const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      {desc && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 shrink-0
        ${checked ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-600"}`}
      style={{ width: 44 }}
    >
      <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-300
        ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

// ── Password field ──────────────────────────────────────────────
const PwField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} name={name} value={value}
          onChange={onChange} required placeholder="••••••••"
          className="input-field pr-10" />
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const { dark, toggleTheme } = useTheme();
  const { user, logout }      = useAuth();

  const [pw,        setPw]        = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [notifs,    setNotifs]    = useState({
    dueReminders: true, browserNotifs: false, toastAlerts: true, completionAlerts: true,
  });

  const handlePw = e => setPw(p => ({...p, [e.target.name]: e.target.value}));

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (pw.newPassword !== pw.confirmPassword) { toast.error("Passwords don't match"); return; }
    setPwLoading(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword: pw.currentPassword, newPassword: pw.newPassword,
      });
      toast.success("Password changed! 🔒");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setPwLoading(false); }
  };

  const requestBrowserNotifs = async () => {
    if (!("Notification" in window)) { toast.error("Browser doesn't support notifications"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifs(p => ({...p, browserNotifs: true}));
      toast.success("Browser notifications enabled! 🔔");
      new Notification("TaskFlow", { body: "Notifications are now enabled!" });
    } else {
      toast.error("Permission denied. Enable in browser settings.");
    }
  };

  const exportTasks = async () => {
    try {
      const res = await axiosInstance.get("/tasks");
      const csv = [
        ["ID", "Title", "Description", "Priority", "Status", "Due Date", "Created"].join(","),
        ...res.data.map(t => [
          t.id,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          t.priority, t.status, t.due_date || "", t.created_at,
        ].join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "taskflow-export.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Tasks exported as CSV! 📥");
    } catch { toast.error("Export failed"); }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "TF";

  const strengthLabel = (p) => {
    if (!p) return null;
    if (p.length < 6)  return { label: "Too short", cls: "text-red-500", bars: 1 };
    if (p.length < 9)  return { label: "Moderate",  cls: "text-amber-500", bars: 2 };
    if (p.length < 12) return { label: "Good",       cls: "text-blue-500", bars: 3 };
    return              { label: "Strong",    cls: "text-emerald-500", bars: 4 };
  };
  const strength = strengthLabel(pw.newPassword);

  return (
    <div className="flex-1 min-h-screen bg-slate-100 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <SettingsIcon size={22} className="text-brand-500" />
            Settings
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── 1. Profile ── */}
          <Section icon={User} title="Profile" subtitle="Your account information" delay={0}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shadow-brand-500/25 shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-lg">{user?.username}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">{user?.email}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle2 size={10} /> Active account
                </span>
              </div>
            </div>
          </Section>

          {/* ── 2. Appearance ── */}
          <Section icon={Palette} title="Appearance" subtitle="Customize the look and feel" delay={0.05}>
            <ToggleRow
              label={dark ? "Dark Mode" : "Light Mode"}
              desc={dark ? "Switch to light for a brighter interface" : "Switch to dark for a comfortable night view"}
              checked={dark}
              onChange={toggleTheme}
            />
            
          </Section>

          {/* ── 3. Notifications ── */}
          <Section icon={Bell} title="Notifications" subtitle="Control how you're alerted" delay={0.1}>
            <ToggleRow label="Due Date Reminders" desc="Get notified when tasks are due soon"
              checked={notifs.dueReminders} onChange={() => setNotifs(p => ({...p, dueReminders: !p.dueReminders}))} />
            <ToggleRow label="Toast Alerts" desc="Show toast messages for task actions"
              checked={notifs.toastAlerts} onChange={() => setNotifs(p => ({...p, toastAlerts: !p.toastAlerts}))} />
            <ToggleRow label="Completion Celebrations" desc="Show celebration when tasks are completed"
              checked={notifs.completionAlerts} onChange={() => setNotifs(p => ({...p, completionAlerts: !p.completionAlerts}))} />
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Browser Notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">Get OS-level push notifications</p>
                </div>
                <button onClick={notifs.browserNotifs ? undefined : requestBrowserNotifs}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${notifs.browserNotifs
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      : "bg-brand-500 text-white hover:bg-brand-600"}`}>
                  {notifs.browserNotifs ? "✓ Enabled" : "Enable"}
                </button>
              </div>
            </div>
          </Section>

          

          {/* ── 5. Security / Change Password ── */}
          <Section icon={Shield} title="Security" subtitle="Manage your account security" delay={0.2}>
            <form onSubmit={changePassword} className="space-y-4">
              <PwField label="Current Password"      name="currentPassword"  value={pw.currentPassword}  onChange={handlePw} />
              <PwField label="New Password"          name="newPassword"      value={pw.newPassword}      onChange={handlePw} />
              {/* Strength bar */}
              {pw.newPassword && strength && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${i <= strength.bars ? strength.cls.replace("text-","bg-") : "bg-slate-200 dark:bg-slate-700"}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.cls}`}>{strength.label}</p>
                </div>
              )}
              <PwField label="Confirm New Password"  name="confirmPassword"  value={pw.confirmPassword}  onChange={handlePw} />
              <button type="submit" disabled={pwLoading} className="btn-primary">
                {pwLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ShieldCheck size={15} />}
                {pwLoading ? "Updating…" : "Change Password"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/40">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Session</p>
              <button onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                <LogOut size={15} />
                Logout of all devices
              </button>
            </div>
          </Section>

          {/* ── 6. Data ── */}
          <Section icon={Database} title="Data" subtitle="Manage your task data" delay={0.25}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Export Tasks</p>
                  <p className="text-xs text-slate-400 mt-0.5">Download all your tasks as CSV</p>
                </div>
                <button onClick={exportTasks} className="btn-ghost border border-slate-200 dark:border-slate-700 text-xs px-3 py-2">
                  <Download size={14} />
                  Export CSV
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50/60 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-red-400 mt-0.5">Permanently remove all data. Cannot be undone.</p>
                </div>
                <button
                  onClick={() => toast.error("Contact support to delete your account")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800/50">
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </Section>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;