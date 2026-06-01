import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ClipboardList,
  FolderKanban,
  Building2,
  User2,
  Flag,
  Clock3,
  FileText,
  Save,
  ArrowLeft,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { fetchProjects } from "../../redux/projectSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { fetchUsers } from "../../redux/userSlice";
import {
  fetchTaskById,
  createTask,
  updateTask,
  clearCurrentTask,
  clearTaskError,
} from "../../redux/taskSlice";

// ── TaskForm Page ─────────────────────────────────────────────────────────────
function TaskForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { items: projects, loading: projectsLoading } = useSelector(
    (state) => state.projects,
  );
  const { items: departments, loading: departmentsLoading } = useSelector(
    (state) => state.departments,
  );
  const { items: users, loading: usersLoading } = useSelector(
    (state) => state.users,
  );
  const {
    currentTask,
    currentTaskLoading,
    currentTaskError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.tasks);

  const [form, setForm] = useState({
    project_id: "",
    title: "",
    description: "",
    department_id: "",
    assigned_to: "",
    estimated_hours: "",
    status: "Pending",
    priority: "Medium",
  });

  const error = isEdit ? updateError : createError;
  const isLoading = isEdit ? updateLoading : createLoading;

  // Fetch related data and the task by ID if editing
  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchDepartments());
    dispatch(fetchUsers());
    
    if (isEdit) {
      dispatch(fetchTaskById(id));
    }

    return () => {
      dispatch(clearCurrentTask());
      dispatch(clearTaskError());
    };
  }, [dispatch, id, isEdit]);

  // Populate form once task is loaded
  useEffect(() => {
    if (isEdit && currentTask) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        project_id: currentTask.project_id ? String(currentTask.project_id) : "",
        title: currentTask.title || "",
        description: currentTask.description || "",
        department_id: currentTask.department_id
          ? String(currentTask.department_id)
          : "",
        assigned_to: currentTask.assigned_to
          ? String(currentTask.assigned_to)
          : "",
        estimated_hours: currentTask.estimated_hours !== null
          ? String(currentTask.estimated_hours)
          : "",
        status: currentTask.status || "Pending",
        priority: currentTask.priority || "Medium",
      });
    }
  }, [currentTask, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) dispatch(clearTaskError());
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project_id || !form.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      project_id: Number(form.project_id),
      title: form.title,
      description: form.description || "",
      department_id: form.department_id ? Number(form.department_id) : null,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      estimated_hours: form.estimated_hours
        ? Number(form.estimated_hours)
        : null,
      status: form.status,
      priority: form.priority,
    };

    try {
      if (isEdit) {
        await dispatch(updateTask({ id: Number(id), taskData: payload })).unwrap();
        toast.success("Task updated successfully");
      } else {
        await dispatch(createTask(payload)).unwrap();
        toast.success("Task created successfully");
      }
      navigate("/tasks");
    } catch (err) {
      toast.error(err || `Failed to ${isEdit ? "update" : "create"} task`);
    }
  };

  // ── Loading state for fetching task details ──────────────────────────────────
  if (isEdit && currentTaskLoading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading task details...</p>
        </div>
      </AdminLayout>
    );
  }

  // ── Error / Not found for edit mode ──────────────────────────────────────────
  if (isEdit && (currentTaskError || (!currentTaskLoading && !currentTask))) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Task not found</h2>
          <p className="text-gray-500 mt-2">
            {currentTaskError || "The task you are looking for does not exist."}
          </p>
          <Link
            to="/tasks"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
          >
            Back to Tasks
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Task" : "Create New Task"}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEdit
                  ? `Update task #${currentTask?.id} — ${currentTask?.title}`
                  : "Create and assign tasks to your workflow team"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Card Header */}
          <div className="border-b border-gray-100 px-8 py-6 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <ClipboardList className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Task Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEdit
                  ? "Update the task details below"
                  : "Fill in task details, ownership, schedule, and priority"}
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Project *
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <FolderKanban size={18} className="text-gray-400" />
                    <select
                      name="project_id"
                      value={form.project_id}
                      onChange={handleChange}
                      className="w-full outline-none ml-3 bg-transparent text-sm"
                      required
                    >
                      <option value="" disabled>
                        {projectsLoading ? "Loading projects..." : "Select Project"}
                      </option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Task Name *
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <ClipboardList size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter task name"
                      className="w-full outline-none ml-3 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Assigned Department
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <Building2 size={18} className="text-gray-400" />
                    <select
                      name="department_id"
                      value={form.department_id}
                      onChange={handleChange}
                      className="w-full outline-none ml-3 bg-transparent text-sm"
                    >
                      <option value="">
                        {departmentsLoading
                          ? "Loading departments..."
                          : "Select Department"}
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned Staff */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Assigned To
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <User2 size={18} className="text-gray-400" />
                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="w-full outline-none ml-3 bg-transparent text-sm"
                    >
                      <option value="">
                        {usersLoading ? "Loading staff..." : "Select Staff"}
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.full_name || user.username || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Estimated Hours
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <Clock3 size={18} className="text-gray-400" />
                    <input
                      type="number"
                      name="estimated_hours"
                      value={form.estimated_hours}
                      onChange={handleChange}
                      step="0.25"
                      min="0"
                      placeholder="Enter planned hours"
                      className="w-full outline-none ml-3 text-sm"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Status
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <Activity size={18} className="text-gray-400" />
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full outline-none ml-3 bg-transparent text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Priority
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-all">
                    <Flag size={18} className="text-gray-400" />
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full outline-none ml-3 bg-transparent text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Task Details
                </label>
                <div className="border border-gray-200 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                  <div className="flex items-start">
                    <FileText size={18} className="text-gray-400 mt-1" />
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Write task details here..."
                      className="w-full outline-none ml-3 h-40 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 mt-6 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8">
                <Link
                  to="/tasks"
                  className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 transition-all px-6 py-3 rounded-2xl font-medium text-center"
                >
                  Cancel
                </Link>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all text-white px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={18} />
                  {isLoading ? "Saving..." : isEdit ? "Update Task" : "Save Task"}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default TaskForm;
