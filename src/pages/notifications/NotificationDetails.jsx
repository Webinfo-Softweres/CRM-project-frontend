// src/pages/notifications/NotificationDetails.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User as UserIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { fetchNotifications, markNotificationRead } from "../../redux/notificationSlice";
import { fetchUsers } from "../../redux/userSlice";

const formatDate = (dateString) => {
  if (!dateString) return "—";
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

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500 sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 flex-1">
        {value ?? "—"}
      </dd>
    </div>
  );
}

function NotificationDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { items: notifications, loading: notificationsLoading, error } =
    useSelector((state) => state.notifications);
  const { items: users } = useSelector((state) => state.users);

  useEffect(() => {
    if (notifications.length === 0) {
      dispatch(fetchNotifications());
    }
    dispatch(fetchUsers());
  }, [dispatch, notifications.length]);

  const notification = notifications.find((n) => String(n.id) === String(id));

  // Automatically mark as read if it is unread when viewing details
  useEffect(() => {
    if (notification && notification.status?.toLowerCase() === "unread") {
      dispatch(markNotificationRead(notification.id));
    }
  }, [dispatch, notification]);

  if (notificationsLoading && notifications.length === 0) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || (!notificationsLoading && !notification)) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Notification not found</h2>
          <p className="text-gray-500 mt-2">
            {error || "The notification alert you are looking for does not exist."}
          </p>
          <Link
            to="/notifications"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
          >
            Back to Notifications
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const assignedUser = users.find((u) => u.id === notification.user_id);
  const userName = assignedUser
    ? (assignedUser.name || assignedUser.full_name || assignedUser.username || assignedUser.email)
    : `User #${notification.user_id}`;
  const userEmail = assignedUser?.email || "—";
  const userInitials = (userName || "U").charAt(0).toUpperCase();

  const isUnread = notification.status?.toLowerCase() === "unread";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                to="/notifications"
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl shrink-0 transition-all cursor-pointer"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Notification #{notification.id}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                      isUnread
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {isUnread ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {notification.status || "Unread"}
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-2">
                  System Alert
                </h1>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                  Assigned to <span className="font-semibold text-slate-700">{userName}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <Bell size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Notification Information</h2>
              </div>
              <dl className="px-6 py-2">
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                        isUnread
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      }`}
                    >
                      {notification.status || "Unread"}
                    </span>
                  }
                />
                <InfoRow label="Assigned User" value={`${userName} (${userEmail})`} />
                <InfoRow label="Message Alert" value={<p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{notification.message}</p>} />
              </dl>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Timeline/Meta sidecard */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock size={16} className="text-slate-400" />
                Alert Schedule
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <Calendar size={18} className="text-slate-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created Date</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <Clock size={18} className="text-slate-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Time Received</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
                  <UserIcon size={18} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-blue-500 font-medium">Recipient</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {userName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationDetails;
