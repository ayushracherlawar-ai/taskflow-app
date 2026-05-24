import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

// Shared input classes
const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm
  bg-slate-50 dark:bg-slate-900/50
  border border-slate-200 dark:border-slate-700
  text-slate-800 dark:text-slate-100
  placeholder-slate-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
  transition-all duration-150`;

const labelCls = "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

const AddTask = () => {
  const navigate     = useNavigate();
  const { id }       = useParams();
  const isEdit       = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    title:       "",
    description: "",
    priority:    "medium",
    status:      "pending",
    due_date:    "",
  });

  useEffect(() => {
    if (isEdit) fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      const res  = await axiosInstance.get("/tasks");
      const task = res.data.find((t) => t.id === Number(id));
      if (task) setFormData({
        title:       task.title       || "",
        description: task.description || "",
        priority:    task.priority    || "medium",
        status:      task.status      || "pending",
        due_date:    task.due_date    || "",
      });
    } catch {
      toast.error("Failed to load task");
    } finally {
      setFetching(false);
    }
  };

  const set = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/tasks/${id}`, formData);
        toast.success("Task updated");
      } else {
        await axiosInstance.post("/tasks", formData);
        toast.success("Task created!");
      }
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex-1 min-h-screen bg-slate-100 dark:bg-[#0f1117] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-100 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400
            hover:text-slate-800 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
              <ClipboardList size={20} className="text-brand-500" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
                {isEdit ? "Edit Task" : "New Task"}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isEdit ? "Update the details below" : "Fill in the details to create a task"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={set("title")}
                required
                placeholder="What needs to be done?"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={formData.description}
                onChange={set("description")}
                placeholder="Add more details (optional)…"
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={set("priority")}
                  className={inputCls}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={formData.status}
                  onChange={set("status")}
                  className={inputCls}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className={labelCls}>Due Date</label>
              <input
                type="date"
                value={formData.due_date || ""}
                onChange={set("due_date")}
                className={inputCls}
                style={{ colorScheme: "auto" }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                  disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold
                  shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
                  transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save size={15} />
                }
                {loading ? "Saving…" : (isEdit ? "Update Task" : "Create Task")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold
                  text-slate-600 dark:text-slate-300
                  bg-slate-100 dark:bg-slate-700
                  hover:bg-slate-200 dark:hover:bg-slate-600
                  transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddTask;