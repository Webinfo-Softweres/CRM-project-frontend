// src/pages/notifications/NotificationList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";

import { fetchNotifications, deleteNotification } from "../../redux/notificationSlice";
import { fetchUsers } from "../../redux/userSlice";
import { usePermissions } from "../../hooks/usePermissions";

import {
  Plus,
  Search,
  Filter,
  Bell,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 8;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

function NotificationList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const showActions = can("notifications:read") || can("notifications:update") || can("notifications:delete");

  const { items: notifications, loading, error, deleteLoading } = useSelector(
    (state) => state.notifications
  );
  const { items: users } = useSelector(
    (state) => state.users
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUsers());
  }, [dispatch]);

  const openDeleteModal = (id) => setDeleteTargetId(id);
  const closeDeleteModal = () => setDeleteTargetId(null);

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteNotification(deleteTargetId)).unwrap();
      toast.success("Notification deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const getUserDetails = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? {
      name: user.name || user.full_name || user.username || `User #${userId}`,
      email: user.email || "",
      initials: (user.name || user.full_name || user.username || "?").charAt(0).toUpperCase()
    } : {
      name: `User #${userId}`,
      email: "",
      initials: "U"
    };
  };

  // — Search and Status Filter
  const filtered = [...notifications].filter((n) => {
    const user = getUserDetails(n.user_id);
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      n.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // — Stats
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(
    (n) => n.status?.toLowerCase() === "unread"
  ).length;
  const readCount = notifications.filter(
    (n) => n.status?.toLowerCase() === "read"
  ).length;

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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Notification?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this notification alert?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 transition-all px-5 py-3 rounded-2xl font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Trash2 size={16} />
                  {deleteLoading ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage alerts and system notifications for your team
            </p>
          </div>

          {can("notifications:create") && (
            <Link
              to="/notifications/add"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Create Notification
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Notifications</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {totalCount}
                </h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Bell className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unread Alerts</p>
                <h2 className="text-3xl font-bold mt-2 text-amber-600">
                  {unreadCount}
                </h2>
              </div>
              <div className="bg-amber-100 p-4 rounded-2xl">
                <AlertCircle className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Read Notifications</p>
                <h2 className="text-3xl font-bold mt-2 text-green-600">
                  {readCount}
                </h2>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <CheckCircle2 className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full md:w-96">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by user or message..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="relative w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-12 py-3 outline-none bg-white text-sm cursor-pointer w-full md:w-auto font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Unread">Unread Only</option>
              <option value="Read">Read Only</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading notifications...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[240px]">
                      User
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Message
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px]">
                      Status
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[180px]">
                      Created At
                    </th>
                    {showActions && (
                      <th className="text-center p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={showActions ? 5 : 4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Bell size={48} className="text-gray-300" />
                          <h2 className="text-xl font-bold text-slate-700 mt-4">
                            No Notifications Found
                          </h2>
                          <p className="text-gray-500 mt-1 text-sm mb-4">
                            {notifications.length === 0
                              ? "No alerts or notifications have been generated yet."
                              : "No notifications match your filters."}
                          </p>
                          {notifications.length === 0 && can("notifications:create") && (
                            <Link
                              to="/notifications/add"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow transition-all text-sm font-medium"
                            >
                              <Plus size={16} />
                              Create First Notification
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((n) => {
                      const user = getUserDetails(n.user_id);
                      const isUnread = n.status?.toLowerCase() === "unread";
                      return (
                        <tr
                          key={n.id}
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                        >
                          {/* User details */}
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0 text-sm">
                                {user.initials}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-slate-800 text-sm truncate">
                                  {user.name}
                                </h3>
                                <p className="text-xs text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Message */}
                          <td className="p-5">
                            <div className="text-sm text-slate-700 leading-relaxed font-medium">
                              {n.message && n.message.length > 80
                                ? `${n.message.substring(0, 80)}...`
                                : n.message}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                isUnread
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {isUnread ? (
                                <AlertCircle size={12} />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              {n.status || "Unread"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-5 text-sm text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              <Calendar size={13} className="text-gray-400" />
                              {formatDate(n.created_at)}
                            </div>
                          </td>

                          {showActions && (
                            <td className="p-5">
                              <div className="flex items-center gap-2 justify-center">
                                {can("notifications:read") && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/notifications/${n.id}`)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                )}
                                {can("notifications:update") && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/notifications/edit/${n.id}`)}
                                    className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    title="Edit Notification"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {can("notifications:delete") && (
                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal(n.id)}
                                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    title="Delete Notification"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Mobile Grid/Cards View */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginated.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 py-16 flex flex-col items-center justify-center shadow-sm">
                <Bell size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Notifications Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm mb-4">
                  {notifications.length === 0
                    ? "No alerts or notifications have been generated yet."
                    : "No notifications match your filters."}
                </p>
                {notifications.length === 0 && can("notifications:create") && (
                  <Link
                    to="/notifications/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow transition-all text-sm font-medium"
                  >
                    <Plus size={16} />
                    Create First Notification
                  </Link>
                )}
              </div>
            ) : (
              paginated.map((n) => {
                const user = getUserDetails(n.user_id);
                const isUnread = n.status?.toLowerCase() === "unread";
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0 text-sm">
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm truncate">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 ${
                          isUnread
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {n.status || "Unread"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-700 font-medium leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{formatDate(n.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {can("notifications:read") && (
                          <button
                            type="button"
                            onClick={() => navigate(`/notifications/${n.id}`)}
                            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {can("notifications:update") && (
                          <button
                            type="button"
                            onClick={() => navigate(`/notifications/edit/${n.id}`)}
                            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            title="Edit Notification"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {can("notifications:delete") && (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(n.id)}
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length === 0
                  ? 0
                  : `${startIndex + 1}–${Math.min(
                      startIndex + PAGE_SIZE,
                      filtered.length
                    )} of ${filtered.length}`}
              </span>{" "}
              notifications
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    safePage === page
                      ? "bg-blue-600 text-white shadow"
                      : "border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default NotificationList;
