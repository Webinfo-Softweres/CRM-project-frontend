// Navbar.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Bell, Search, UserCircle2, Settings, Menu, Shield, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchUsers } from "../../redux/userSlice";
import { fetchUnreadNotifications, markNotificationRead } from "../../redux/notificationSlice";
import { logoutUser } from "../../redux/authSlice";
import { rolesData } from "../../data/rolesData";
import { usePermissions } from "../../hooks/usePermissions";
import GlobalSearchModal from "./GlobalSearchModal";

function Navbar({ setSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const users = useSelector((state) => state.users.items);
  const unreadNotifications = useSelector((state) => state.notifications.unreadItems);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSettings(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
    setShowSettings(false);
  };

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  const token = Cookies.get("access_token");
  let loggedInUser = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const decodedId = decoded.id || decoded.sub;
      loggedInUser = users.find(
        (u) =>
          String(u.id) === String(decodedId) ||
          u.email === decoded.sub ||
          u.username === decoded.sub
      );
    } catch (e) {
      console.error("Error decoding token in Navbar:", e);
    }
  }

  const getRoleName = (roleId) => {
    const match = rolesData.find((r) => r.id === roleId);
    return match ? match.role_name : "User";
  };

  useEffect(() => {
    if (loggedInUser?.id) {
      dispatch(fetchUnreadNotifications(loggedInUser.id));
    }
  }, [dispatch, loggedInUser?.id]);

  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await dispatch(markNotificationRead(id)).unwrap();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleLogout = async () => {
    setShowProfile(false);
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Navigate even if API fails
    }
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40"
    >
      <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden bg-slate-100 hover:bg-slate-200 transition-all p-2 rounded-xl flex-shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Search */}
        <div 
          onClick={() => setIsGlobalSearchOpen(true)}
          className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-2xl w-72 xl:w-80 cursor-pointer hover:bg-slate-200 transition-colors group"
        >
          <Search size={18} className="text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />

          <div className="ml-3 w-full text-sm text-gray-500 flex items-center justify-between">
            <span>Quick search...</span>
            <kbd className="hidden xl:inline-block px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-400 shadow-sm">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="lg:hidden bg-slate-100 hover:bg-slate-200 transition-all p-2 md:p-3 rounded-xl cursor-pointer"
          >
            <Search size={18} className="text-slate-700" />
          </button>


          {/* Notification */}
          {can("notifications:read") && (
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative bg-slate-100 hover:bg-slate-200 transition-all p-2 md:p-3 rounded-xl cursor-pointer"
              >
                <Bell size={18} className="text-slate-700" />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Overlay for clicking outside */}
              {showNotifications && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
              )}

              {/* Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -right-[70px] sm:right-0 mt-2 w-[300px] sm:w-96 bg-white rounded-3xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Bell size={16} className="text-blue-500" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {unreadNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                          <Bell size={32} className="text-gray-300" />
                          <span>No new notifications</span>
                        </div>
                      ) : (
                        unreadNotifications.slice(0, 5).map((n) => {
                          const isUnread = n.status?.toLowerCase() === "unread";
                          const truncatedMessage = n.message && n.message.length > 60
                            ? `${n.message.substring(0, 60)}...`
                            : n.message;
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (isUnread) {
                                  dispatch(markNotificationRead(n.id));
                                }
                                setShowNotifications(false);
                                navigate(`/notifications/${n.id}`);
                              }}
                              className={`p-4 flex items-start gap-3 transition-colors text-left cursor-pointer hover:bg-slate-50 ${
                                isUnread ? "bg-blue-50/50" : ""
                              }`}
                            >
                              <div
                                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                  isUnread
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <Bell size={14} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs text-slate-700 leading-normal break-words ${isUnread ? "font-semibold text-slate-900" : ""}`}>
                                  {truncatedMessage}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                                  {new Date(n.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {isUnread && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition shrink-0 self-center"
                                  title="Mark as read"
                                >
                                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full block" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="px-4 pt-3 pb-1 border-t border-gray-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-block py-1 px-3 rounded-lg hover:bg-blue-50 w-full"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Settings */}
          {can("roles:read") && (
            <div className="relative">
              <button
                onClick={toggleSettings}
                className="flex bg-slate-100 hover:bg-slate-200 transition-all p-2 md:p-3 rounded-xl cursor-pointer text-slate-700"
              >
                <Settings size={18} />
              </button>

              {/* Dropdown Overlay for clicking outside */}
              {showSettings && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
              )}

              {/* Settings Dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Settings size={16} className="text-slate-500" />
                        Settings
                      </h3>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/settings/permissions"
                        onClick={() => setShowSettings(false)}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                          <Shield size={16} />
                        </div>
                        <span className="text-xs font-semibold">Permissions</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-all p-1.5 md:pr-3 rounded-xl cursor-pointer group"
            >
              {/* Avatar */}
              <div className="relative">
                {loggedInUser?.avatar ? (
                  <img
                    src={loggedInUser.avatar}
                    alt={loggedInUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {getInitials(loggedInUser?.name)}
                  </div>
                )}
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden md:block text-left">
                <h3 className="text-sm font-semibold text-slate-700">
                  {loggedInUser ? loggedInUser.name : "Admin User"}
                </h3>
                <p className="text-xs text-slate-500">
                  {loggedInUser ? getRoleName(loggedInUser.role_id) : "Administrator"}
                </p>
              </div>

              {/* Dropdown chevron */}
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 hidden md:block ${showProfile ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Overlay */}
            {showProfile && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
            )}

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                    <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {loggedInUser?.email || "admin@example.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 hover:text-blue-600 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-slate-700 hover:text-red-600 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-red-100 text-red-600 shrink-0">
                        <LogOut size={16} />
                      </div>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GlobalSearchModal 
        isOpen={isGlobalSearchOpen} 
        onClose={() => setIsGlobalSearchOpen(false)} 
      />
    </motion.div>
  );
}

export default Navbar;
