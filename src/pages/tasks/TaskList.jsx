import Pagination from "../../components/common/Pagination";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { usePermissions } from "../../hooks/usePermissions";

import AdminLayout from "../../layouts/AdminLayout";

import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";
import AnimatedTableBody from "../../components/animations/AnimatedTableBody";
import AnimatedTableRow from "../../components/animations/AnimatedTableRow";

import PriorityBadge from "../../components/ui/PriorityBadge";

import {
  Plus,
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertCircle,
  User2,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { fetchTasks, deleteTask } from "../../redux/taskSlice";
import { fetchUsers } from "../../redux/userSlice";

// ── helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const PAGE_SIZE = 8;

const taskStatuses = ["Pending", "In Progress", "Completed", "Rejected"];

const statusSelectStyles = {
  Pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  "In Progress": "border-orange-200 bg-orange-50 text-orange-700",
  Completed: "border-green-200 bg-green-50 text-green-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

function TaskList() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const hasActions = can("tasks:read") || can("tasks:update") || can("tasks:delete");

  const { items: taskData, loading, deleteLoading, lastFetched: tasksLastFetched } = useSelector((state) => state.tasks);
  const { items: usersData, lastFetched: usersLastFetched } = useSelector((state) => state.users);

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState("");

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isTasksStale = !tasksLastFetched || (Date.now() - tasksLastFetched > CACHE_DURATION);
    const isUsersStale = !usersLastFetched || (Date.now() - usersLastFetched > CACHE_DURATION);

    if (taskData.length === 0 || isTasksStale) {
      dispatch(fetchTasks());
    }
    if (usersData.length === 0 || isUsersStale) {
      dispatch(fetchUsers());
    }
  }, [dispatch, taskData.length, usersData.length, tasksLastFetched, usersLastFetched]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tasks when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    const CACHE_DURATION = 5 * 60 * 1000;
    const isTasksStale = !tasksLastFetched || (Date.now() - tasksLastFetched > CACHE_DURATION);

    if (searchQuery || taskData.length === 0 || isTasksStale) {
      dispatch(fetchTasks(params));
    }
  }, [dispatch, searchQuery, taskData.length, tasksLastFetched]);

  const getStaffName = (userId) => {
    const user = usersData.find((u) => u.id === userId);
    return user?.name || "Not assigned";
  };

  // ── filtering ──────────────────────────────────────────────────────────
  const filtered = taskData.filter((task) => {
    const matchStatus =
      statusFilter === "All" || task.status === statusFilter;
    return matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // reset page when filters change
  const handleSearch = (v) => { setSearch(v); }; // we no longer reset current page here, debounced effect does it
  const handleStatus = (v) => { setStatusFilter(v); setCurrentPage(1); };

  // ── delete helpers ─────────────────────────────────────────────────────────
  const openDeleteModal = (task) => {
    setDeleteTargetId(task.id);
    setDeleteTargetTitle(task.title);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setDeleteTargetTitle("");
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteTask(Number(deleteTargetId))).unwrap();
      toast.success("Task deleted successfully");
      closeDeleteModal();
    } catch (err) {
      toast.error(err || "Failed to delete task");
    }
  };

  // ── stats ──────────────────────────────────────────────────────────────
  const completedTasks = taskData.filter((t) => t.status === "Completed").length;
  const inProgressTasks = taskData.filter((t) => t.status === "In Progress").length;
  const pendingTasks = taskData.filter((t) => t.status === "Pending").length;

  return (
    <AdminLayout>
      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 size={32} className="text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Task?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">&quot;{deleteTargetTitle}&quot;</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 transition-all px-5 py-3 rounded-2xl font-medium text-slate-700"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <Trash2 size={16} />
                  {deleteLoading ? "Deleting..." : "Delete Task"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedPage className="space-y-6 flex-1 flex flex-col">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Task Management
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Track project tasks, assignments, and execution
            </p>
          </div>

          {can("tasks:create") && (
            <Link
              to="/tasks/create"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-all text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={18} />
              Create Task
            </Link>
          )}
        </motion.div>

        {/* ── STATS ── */}
        <AnimatedPage className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {taskData.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-2xl">
                <ClipboardList className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h2 className="text-3xl font-bold mt-2 text-green-600">
                  {completedTasks}
                </h2>
              </div>
              <div className="bg-green-100 p-3 rounded-2xl">
                <CheckCircle2 className="text-green-600" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <h2 className="text-3xl font-bold mt-2 text-orange-500">
                  {inProgressTasks}
                </h2>
              </div>
              <div className="bg-orange-100 p-3 rounded-2xl">
                <Clock3 className="text-orange-500" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <h2 className="text-3xl font-bold mt-2 text-red-500">
                  {pendingTasks}
                </h2>
              </div>
              <div className="bg-red-100 p-3 rounded-2xl">
                <AlertCircle className="text-red-500" />
              </div>
            </div>
          </AnimatedCard>
        </AnimatedPage>

        {/* ── SEARCH & FILTER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between"
        >
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:w-[420px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by title, description, status, or priority"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="All">All Statuses</option>
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Title
                        </th>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[180px]">
                          Assigned To
                        </th>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[130px]">
                          Est. Hours
                        </th>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px]">
                          Status
                        </th>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                          Priority
                        </th>
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[150px]">
                          Created
                        </th>
                        {hasActions && (
                          <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[130px]">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>

                    <AnimatedTableBody>
                      {taskData.length > 0 && paginated.length === 0 ? (
                        <tr>
                          <td colSpan={hasActions ? 7 : 6} className="py-16 text-center text-gray-400">
                            No tasks matching your filters
                          </td>
                        </tr>
                      ) : (
                        paginated.map((task) => (
                          <AnimatedTableRow
                            key={task.id}
                            className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                          >
                        {/* Title */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                              {task.title?.charAt(0)}
                            </div>
                            <h3 className="font-semibold text-slate-800 leading-snug">
                              {task.title}
                            </h3>
                          </div>
                        </td>

                        {/* Assigned To */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <User2 size={14} className="text-blue-500 shrink-0" />
                            <span className="text-sm text-slate-700">
                              {getStaffName(task.assigned_to)}
                            </span>
                          </div>
                        </td>

                        {/* Est. Hours */}
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Clock3 size={14} className="text-orange-400" />
                            {task.estimated_hours ?? "—"} hrs
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-5">
                          <div className="relative w-36">
                            <select
                              value={task.status}
                              readOnly
                              className={`w-full appearance-none border rounded-2xl px-4 py-2 pr-9 outline-none text-sm font-semibold shadow-sm ${statusSelectStyles[task.status]}`}
                            >
                              {taskStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                              ▾
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="p-5">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        {/* Created */}
                        <td className="p-5">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <CalendarDays size={13} className="text-slate-400 shrink-0" />
                            <div>
                              <div>{formatDate(task.created_at)}</div>
                              <div className="text-xs text-slate-400">
                                {formatTime(task.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>

                         {hasActions && (
                           <td className="p-5">
                             <div className="flex items-center gap-2">
                               {can("tasks:read") && (
                                 <Link
                                   to={`/tasks/details/${task.id}`}
                                   className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all"
                                 >
                                   <Eye size={15} />
                                 </Link>
                               )}
                               {can("tasks:update") && (
                                 <Link
                                   to={`/tasks/edit/${task.id}`}
                                   className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all"
                                 >
                                   <Pencil size={15} />
                                 </Link>
                               )}
                               {can("tasks:delete") && (
                                 <button
                                   onClick={() => openDeleteModal(task)}
                                   className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"
                                 >
                                   <Trash2 size={15} />
                                 </button>
                               )}
                             </div>
                           </td>
                         )}
                      </AnimatedTableRow>
                        ))
                      )}
                    </AnimatedTableBody>
                  </table>
                </div>

                {taskData.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <ClipboardList size={48} className="text-gray-300" />
                    <h2 className="text-xl font-bold text-slate-700 mt-4">
                      No Tasks Found
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                      Start by creating your first task
                    </p>
                    <Link
                      to="/tasks/create"
                      className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                    >
                      Create Task
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── MOBILE / TABLET CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {taskData.length === 0 ? (
                <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
                  <ClipboardList size={48} className="text-gray-300" />
                  <h2 className="text-xl font-bold text-slate-700 mt-4">
                    No Tasks Found
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Start by creating your first task
                  </p>
                  <Link
                    to="/tasks/create"
                    className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                  >
                    Create Task
                  </Link>
                </div>
              ) : paginated.length === 0 ? (
                <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
                  <ClipboardList size={52} className="text-gray-300" />
                  <h2 className="text-xl font-bold text-slate-700 mt-4">
                    No Tasks Found
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                paginated.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                      {task.title?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(task.created_at)} · {formatTime(task.created_at)}
                      </p>
                    </div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-3">
                    <User2 size={15} className="text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {getStaffName(task.assigned_to)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-3">
                    <Clock3 size={15} className="text-orange-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Est. Hours</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {task.estimated_hours ?? "—"} hrs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="relative">
                    <select
                      value={task.status}
                      readOnly
                      className={`appearance-none border rounded-2xl px-3 py-1.5 pr-8 outline-none text-sm font-semibold shadow-sm ${statusSelectStyles[task.status]}`}
                    >
                      {taskStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      ▾
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/tasks/details/${task.id}`}
                      className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-1.5 transition-all text-sm"
                    >
                      <Eye size={14} />
                    </Link>
                    {can("tasks:update") && (
                      <Link
                        to={`/tasks/edit/${task.id}`}
                        className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-1.5 transition-all text-sm"
                      >
                        <Pencil size={14} />
                      </Link>
                    )}
                    {can("tasks:delete") && (
                      <button
                        onClick={() => openDeleteModal(task)}
                        className="h-9 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-1.5 transition-all text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
                ))
              )}
            </div>

            {/* ── PAGINATION ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length === 0
                    ? 0
                    : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
                </span>{" "}
                tasks
              </p>

              <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
            </div>
          </>
        )}
      </AnimatedPage>
    </AdminLayout>
  );
}

export default TaskList;
