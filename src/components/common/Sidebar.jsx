import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { sidebarMenu } from "../../constants/sidebarMenu";
import { usePermissions } from "../../hooks/usePermissions";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";
import { logoutUser } from "../../redux/authSlice";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  Contact,
  FolderKanban,
  ClipboardList,
  ListChecks,
  CheckSquare,
  FileText,
  Receipt,
  ClipboardCheck,
  Star,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquareMore,
  LogOut,
  X,
  Zap,
  Shield,
  Bell,
  Clock,
} from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const [openMenu, setOpenMenu] = useState("");

  const isPathActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Detect Screen
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Icons
  const icons = {
    Dashboard: LayoutDashboard,
    Staff: UserCheck,
    Customers: Users,
    "Customer List": Contact,
    Enquiries: MessageSquareMore,
    Quotations: Receipt,
    Projects: FolderKanban,
    Tasks: ClipboardList,
    "Task List": ListChecks,
    "My Tasks": CheckSquare,
    "Work Reports": ClipboardCheck,
    "Customer Feedback": Star,
    Activity: Activity,
    Settings: Settings,
    Permissions: Shield,
    Notifications: Bell,
    Attendance: Clock,
    Default: FileText,
  };

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? "" : title);
  };

  const activeMenuTitle = sidebarMenu.find((item) => {
    if (!item.children) {
      return false;
    }

    return (
      isPathActive(item.path) ||
      item.children.some((child) => isPathActive(child.path))
    );
  })?.title;

  const visibleOpenMenu = activeMenuTitle || openMenu;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen || isDesktop ? 0 : -320,
        }}
        transition={{ duration: 0.25 }}
        className="fixed left-0 top-0 w-72 h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl z-50"
      >
        {/* Top */}
        <div className="px-6 py-6 border-b border-slate-700 flex items-center justify-center gap-3">
          <Zap size={28} className="text-blue-400 fill-blue-400/20" />
          <h1 className="text-2xl font-bold tracking-wide">ZYVERA</h1>

          {/* Mobile Close */}
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-6 bg-slate-700 hover:bg-slate-600 p-2 rounded-xl transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu */}
        <div className="sidebar-scrollbar flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {(() => {
            const filteredMenu = sidebarMenu
              .map((item) => {
                if (item.children) {
                  const filteredChildren = item.children.filter(
                    (child) => !child.permission || can(child.permission)
                  );
                  if (filteredChildren.length === 0 && item.children.length > 0) {
                    return null;
                  }
                  return { ...item, children: filteredChildren };
                }
                if (item.permission && !can(item.permission)) {
                  return null;
                }
                return item;
              })
              .filter(Boolean);

            return filteredMenu.map((item, index) => {
            const isActive =
              isPathActive(item.path) ||
              item.children?.some((child) => isPathActive(child.path));

            const Icon = icons[item.title] || icons.Default;

            return (
              <div key={index}>
                {/* Main Menu */}
                <button
                  onClick={() =>
                    item.children
                      ? toggleMenu(item.title)
                      : !isDesktop && setSidebarOpen(false)
                  }
                  className={`w-full group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200
                  
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-4 w-full"
                    onClick={() => {
                      if (!isDesktop) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl transition-all
                      
                      ${
                        isActive
                          ? "bg-white/20"
                          : "bg-slate-700 group-hover:bg-slate-600"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Title */}
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>

                  {/* Arrow */}
                  {item.children && (
                    <>
                      {visibleOpenMenu === item.title ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu */}
                {item.children && visibleOpenMenu === item.title && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child, childIndex) => {
                      const ChildIcon = icons[child.title] || icons.Default;

                      const isChildActive = isPathActive(child.path);

                      return (
                        <Link
                          key={childIndex}
                          to={child.path}
                          onClick={() => {
                            if (!isDesktop) {
                              setSidebarOpen(false);
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all
                              
                              ${
                                isChildActive
                                  ? "bg-slate-700 text-white"
                                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
                              }`}
                        >
                          <ChildIcon size={16} />

                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
            });
          })()}
        </div>

        {/* Logout */}
        <div className="p-5 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <LogOut size={18} className="text-white" />
            Logout
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;
