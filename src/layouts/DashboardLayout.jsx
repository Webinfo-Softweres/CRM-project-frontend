// DashboardLayout.jsx

import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FolderKanban } from "lucide-react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navClass =
    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 p-5 transition-all duration-300
        
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Workflow CRM</h2>

            <p className="text-sm text-slate-500 mt-1">Project Dashboard</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden bg-slate-100 p-2 rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          <NavLink
            to="/projects"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${navClass} ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            <FolderKanban size={18} />
            Projects
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Workflow CRM</h2>

          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 md:p-6 flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
