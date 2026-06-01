// src/pages/notifications/NotificationForm.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ArrowLeft,
  Save,
  MessageSquare,
  User as UserIcon,
  Bell,
  Activity,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  createNotification,
  updateNotification,
  fetchNotifications,
} from "../../redux/notificationSlice";
import { fetchUsers } from "../../redux/userSlice";

function NotificationForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { items: users, loading: usersLoading } = useSelector(
    (state) => state.users
  );
  const {
    items: notifications,
    loading: notificationsLoading,
    createLoading,
    updateLoading,
    createError,
    updateError,
  } = useSelector((state) => state.notifications);

  const existingNotification = isEdit
    ? notifications.find((n) => String(n.id) === String(id))
    : null;

  const isLoading = createLoading || updateLoading;
  const error = isEdit ? updateError : createError;

  const [form, setForm] = useState({
    user_id: "",
    message: "",
    status: "Unread",
  });

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
    if (isEdit && notifications.length === 0) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, users.length, isEdit, notifications.length]);

  // Load existing notification details in edit mode
  useEffect(() => {
    if (isEdit && existingNotification) {
      setForm({
        user_id: existingNotification.user_id || "",
        message: existingNotification.message || "",
        status: existingNotification.status || "Unread",
      });
    }
  }, [isEdit, existingNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !form.user_id) {
      toast.error("Please select a user");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      if (isEdit) {
        const payload = {
          message: form.message.trim(),
          status: form.status,
        };
        await dispatch(
          updateNotification({ id: Number(id), notificationData: payload })
        ).unwrap();
        toast.success("Notification updated successfully");
      } else {
        const payload = {
          user_id: Number(form.user_id),
          message: form.message.trim(),
          status: form.status,
        };
        await dispatch(createNotification(payload)).unwrap();
        toast.success("Notification created successfully");
      }
      navigate("/notifications");
    } catch (err) {
      toast.error(err || "Failed to save notification");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Notification" : "Create Notification"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                {isEdit
                  ? `Update notification details for alert #${id}`
                  : "Send a notification alert to a specific system user"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading Spinner for Edit Details */}
        {isEdit && notificationsLoading && notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading details...</p>
          </div>
        ) : (
          /* Form Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm p-5 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <Bell size={20} className="text-blue-500" />
                  Notification Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target User */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Assign To User {isEdit ? "" : "*"}
                    </label>

                    <div
                      className={`flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 transition-all duration-200 ${
                        isEdit
                          ? "bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed"
                          : "focus-within:ring-2 focus-within:ring-blue-500"
                      }`}
                    >
                      <UserIcon size={18} className="text-gray-400 font-bold shrink-0" />

                      <select
                        name="user_id"
                        value={form.user_id}
                        onChange={handleChange}
                        className="w-full ml-3 outline-none bg-transparent cursor-pointer text-sm disabled:cursor-not-allowed"
                        required
                        disabled={isEdit}
                      >
                        <option value="" disabled>
                          {usersLoading ? "Loading users..." : "Select user"}
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.full_name || user.username || user.email} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status *
                    </label>

                    <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                      <Activity size={18} className="text-gray-400 font-bold shrink-0" />

                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full ml-3 outline-none bg-transparent cursor-pointer text-sm"
                        required
                      >
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message *
                </label>

                <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                  <MessageSquare size={18} className="text-gray-400 mt-1 shrink-0" />

                  <textarea
                    rows="5"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Enter the notification details or alert message here..."
                    className="w-full ml-3 outline-none bg-transparent resize-none text-sm"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <Link
                  to="/notifications"
                  className="w-full sm:w-fit px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all text-center font-medium text-slate-700 text-sm"
                >
                  Cancel
                </Link>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-fit bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg font-medium cursor-pointer text-sm"
                >
                  <Save size={18} />
                  {isLoading
                    ? "Saving..."
                    : isEdit
                    ? "Update Notification"
                    : "Create Notification"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}

export default NotificationForm;
