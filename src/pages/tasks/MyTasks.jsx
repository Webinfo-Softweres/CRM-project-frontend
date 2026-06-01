import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout";
import PriorityBadge from "../../components/ui/PriorityBadge";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Filter,
  Search,
  User2,
  ChevronDown,
} from "lucide-react";

import { fetchTasks, updateTask } from "../../redux/taskSlice";
import { fetchUsers } from "../../redux/userSlice";

const taskStatuses = ["Pending", "In Progress", "Completed", "Rejected"];

const statusSelectStyles = {
  Pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  "In Progress": "border-orange-200 bg-orange-50 text-orange-700",
  Completed: "border-green-200 bg-green-50 text-green-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function MyTasks() {
  const dispatch = useDispatch();

  const { items: allTasks, loading: tasksLoading } = useSelector(
    (state) => state.tasks,
  );
  const { items: users, loading: usersLoading } = useSelector(
    (state) => state.users,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch tasks when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchTasks(params));
  }, [dispatch, searchQuery]);

  // Show all tasks (filtering will be done by the API later)
  const myTasks = allTasks;

  // Compute stats for logged-in user's tasks
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = myTasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = myTasks.filter((t) => t.status === "Pending").length;

  // Filter tasks by status filter
  const filteredTasks = myTasks.filter((task) => {
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;
    return matchesStatus;
  });

  const getStaffName = (assignedToField) => {
    if (typeof assignedToField === "object" && assignedToField !== null) {
      return assignedToField.name || assignedToField.email || "Not assigned";
    }
    const user = users.find((u) => String(u.id) === String(assignedToField));
    return user ? (user.name || user.email) : "Not assigned";
  };

  const handleStatusChange = async (task, newStatus) => {
    const assignedToId =
      typeof task.assigned_to === "object" && task.assigned_to !== null
        ? task.assigned_to.id
        : task.assigned_to;

    const payload = {
      project_id: task.project_id,
      title: task.title,
      description: task.description || "",
      department_id: task.department_id,
      assigned_to: assignedToId ? Number(assignedToId) : null,
      estimated_hours: task.estimated_hours ? Number(task.estimated_hours) : null,
      status: newStatus,
      priority: task.priority,
    };

    try {
      await dispatch(
        updateTask({ id: Number(task.id), taskData: payload }),
      ).unwrap();
      toast.success("Task status updated successfully");
    } catch (err) {
      toast.error(err || "Failed to update task status");
    }
  };

  const isLoading = tasksLoading || usersLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-gray-500 mt-2 text-lg">
              View assigned tasks and update current work status
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <h2 className="text-4xl font-bold mt-3 text-slate-800">
                  {totalTasks}
                </h2>
                <p className="text-sm text-green-600 mt-2">Assigned to you</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <ClipboardList className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h2 className="text-4xl font-bold mt-3 text-green-600">
                  {completedTasks}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Finished work items
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <CheckCircle2 className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <h2 className="text-4xl font-bold mt-3 text-orange-500">
                  {inProgressTasks}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Currently being worked on
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-2xl">
                <Clock3 className="text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <h2 className="text-4xl font-bold mt-3 text-red-500">
                  {pendingTasks}
                </h2>
                <p className="text-sm text-gray-500 mt-2">Waiting to start</p>
              </div>
              <div className="bg-red-100 p-4 rounded-2xl">
                <AlertCircle className="text-red-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between"
        >
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:w-[420px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, status, or priority"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="All">All Statuses</option>
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading tasks...</p>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-[300px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Title
                    </th>
                    <th className="w-[190px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assigned To
                    </th>
                    <th className="w-[140px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Estimated Hour
                    </th>
                    <th className="w-[190px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="w-[130px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </th>
                    <th className="w-[160px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    <th className="w-[90px] text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ClipboardList size={48} className="text-gray-300" />
                          <h2 className="text-xl font-bold text-slate-700 mt-4">
                            No Tasks Found
                          </h2>
                          <p className="text-gray-500 mt-1 text-sm">
                            {myTasks.length === 0
                              ? "You have no tasks assigned to you yet"
                              : "No tasks match your current filters"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                              {task.title?.charAt(0)}
                            </div>
                            <h3 className="font-semibold text-slate-800">
                              {task.title}
                            </h3>
                          </div>
                        </td>

                        <td className="p-5">
                          <span className="text-sm font-semibold text-slate-700">
                            {getStaffName(task.assigned_to)}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Clock3 size={15} />
                            {task.estimated_hours != null
                              ? `${task.estimated_hours} hrs`
                              : "-"}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="relative w-44">
                            <select
                              value={task.status}
                              onChange={(event) =>
                                handleStatusChange(task, event.target.value)
                              }
                              className={`w-full appearance-none border rounded-2xl px-4 py-2.5 pr-9 outline-none text-sm font-semibold shadow-sm transition-all ${statusSelectStyles[task.status]}`}
                            >
                              {taskStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs">
                              ▾
                            </span>
                          </div>
                        </td>

                        <td className="p-5">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td className="p-5">
                          <span className="text-sm text-slate-600">
                            {formatDate(task.created_at)}
                          </span>
                        </td>

                        <td className="p-5">
                          <Link
                            to={`/tasks/details/${task.id}`}
                            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Responsive Cards View */}
        {!isLoading && filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                      {task.title?.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate">
                      {task.title}
                    </h3>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                    <User2 size={16} className="text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {getStaffName(task.assigned_to)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                    <Clock3 size={16} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Estimated Hour</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {task.estimated_hours != null
                          ? `${task.estimated_hours} hrs`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                    <CalendarDays size={16} className="text-slate-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatDate(task.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-500 mb-2">Status</p>
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          handleStatusChange(task, event.target.value)
                        }
                        className={`w-full appearance-none border rounded-xl px-3 py-2 pr-8 outline-none text-sm font-semibold shadow-sm transition-all ${statusSelectStyles[task.status]}`}
                      >
                        {taskStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                        ▾
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/tasks/details/${task.id}`}
                    className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Eye size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile/Tablet Empty State */}
        {!isLoading && filteredTasks.length === 0 && (
          <div className="lg:hidden bg-white rounded-3xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
            <ClipboardList size={48} className="text-gray-300" />
            <h2 className="text-xl font-bold text-slate-700 mt-4">
              No Tasks Found
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {myTasks.length === 0
                ? "You have no tasks assigned to you yet"
                : "No tasks match your current filters"}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && filteredTasks.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredTasks.length}
              </span>{" "}
              tasks
            </p>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default MyTasks;
