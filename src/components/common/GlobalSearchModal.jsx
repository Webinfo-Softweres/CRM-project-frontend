import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  UserCircle2,
  FolderKanban,
  CheckSquare,
  ListTodo,
  Users,
  Inbox,
  FileText,
  ClipboardCheck,
  UserPlus,
  Activity,
  Shield,
  Plus,
  MessageSquare,
  Bell,
  Clock
} from "lucide-react";

const SEARCHABLE_ITEMS = [
  { id: "dashboard", title: "Dashboard", desc: "Overview of your CRM", icon: LayoutDashboard, path: "/dashboard", category: "Pages" },
  { id: "profile", title: "My Profile", desc: "Manage your account", icon: UserCircle2, path: "/profile", category: "Pages" },
  
  { id: "projects", title: "Projects", desc: "View all projects", icon: FolderKanban, path: "/projects", category: "Pages" },
  { id: "add_project", title: "Add Project", desc: "Create a new project", icon: Plus, path: "/projects/create", category: "Actions" },
  
  { id: "tasks", title: "Tasks", desc: "Manage team tasks", icon: CheckSquare, path: "/tasks", category: "Pages" },
  // { id: "my_tasks", title: "My Tasks", desc: "View tasks assigned to me", icon: ListTodo, path: "/my-tasks", category: "Pages" },
  { id: "add_task", title: "Add Task", desc: "Create a new task", icon: Plus, path: "/tasks/create", category: "Actions" },
  
  { id: "customers", title: "Customers", desc: "Manage client database", icon: Users, path: "/customers", category: "Pages" },
  { id: "add_customer", title: "Add Customer", desc: "Register a new client", icon: Plus, path: "/customers/add", category: "Actions" },
  
  { id: "enquiries", title: "Enquiries", desc: "View incoming leads", icon: Inbox, path: "/enquiries", category: "Pages" },
  { id: "add_enquiry", title: "Add Enquiry", desc: "Log a new enquiry", icon: Plus, path: "/enquiries/add", category: "Actions" },
  
  { id: "quotations", title: "Quotations", desc: "Manage sales quotes", icon: FileText, path: "/quotations", category: "Pages" },
  { id: "add_quotation", title: "Create Quotation", desc: "Generate a new quote", icon: Plus, path: "/quotations/create", category: "Actions" },
  
  { id: "reports", title: "Work Reports", desc: "View daily work reports", icon: ClipboardCheck, path: "/work-reports", category: "Pages" },
  { id: "add_report", title: "Add Work Report", desc: "Submit daily work", icon: Plus, path: "/work-reports/create", category: "Actions" },
  
  { id: "feedback", title: "Feedback", desc: "Customer feedback", icon: MessageSquare, path: "/feedback", category: "Pages" },
  { id: "notifications", title: "Notifications", desc: "System alerts", icon: Bell, path: "/notifications", category: "Pages" },
  
  { id: "staff", title: "Staff Directory", desc: "Manage employees", icon: UserPlus, path: "/staff", category: "Pages" },
  { id: "attendance", title: "Attendance", desc: "View employee punches", icon: Clock, path: "/attendance", category: "Pages" },
  { id: "activity", title: "Activity Logs", desc: "System audit logs", icon: Activity, path: "/activity", category: "Settings" },
  { id: "permissions", title: "Permissions", desc: "Manage roles & access", icon: Shield, path: "/settings/permissions", category: "Settings" },
];

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = SEARCHABLE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems.length > 0) {
        handleSelect(filteredItems[selectedIndex].path);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-900/40"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[70vh]"
        >
          {/* Search Input Area */}
          <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <Search className="text-blue-500 w-6 h-6 mr-4" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pages, settings, or actions..."
              className="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder-slate-400"
            />
            <div className="hidden sm:flex items-center gap-1.5 ml-4">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 shadow-sm">ESC</kbd>
              <span className="text-xs text-slate-400">to close</span>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <Search className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">No results found for &quot;{query}&quot;</p>
                <p className="text-slate-400 text-sm mt-1">Try searching for pages, actions, or settings.</p>
              </div>
            ) : (
              <div className="py-2 space-y-1">
                {filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center px-4 py-3 mx-2 rounded-2xl cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mr-4 ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        <Icon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isSelected ? "text-white" : "text-slate-800"
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${
                          isSelected ? "text-blue-100" : "text-slate-500"
                        }`}>
                          {item.desc}
                        </p>
                      </div>

                      <div className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${
                        isSelected 
                          ? "bg-blue-500/30 text-blue-50" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {item.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-sans shadow-sm">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-sans shadow-sm">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded font-sans shadow-sm">Enter</kbd>
                to select
              </span>
            </div>
            <div className="font-medium text-slate-400">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
