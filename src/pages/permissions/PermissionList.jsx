import Pagination from "../../components/common/Pagination";
// PermissionList.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";

import {
  Plus,
  Search,
  Shield,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  Lock,
  Eye,
  FilePen,
  Layers,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { fetchPermissions, deletePermissionData } from "../../redux/permissionSlice";
import toast from "react-hot-toast";
import { usePermissions } from "../../hooks/usePermissions";

const PAGE_SIZE = 6; // modules per page

// Pick a colour per action type so badges are visually distinct
const actionColors = {
  view:   "bg-blue-100 text-blue-700",
  create: "bg-green-100 text-green-700",
  edit:   "bg-orange-100 text-orange-700",
  update: "bg-orange-100 text-orange-700",
  delete: "bg-red-100 text-red-700",
  manage: "bg-purple-100 text-purple-700",
};

function actionBadgeClass(action) {
  const key = action?.toLowerCase();
  return actionColors[key] ?? "bg-slate-100 text-slate-700";
}

function ActionIcon({ action }) {
  const key = action?.toLowerCase();
  if (key === "view")   return <Eye size={13} />;
  if (key === "create") return <Plus size={13} />;
  if (key === "edit" || key === "update") return <FilePen size={13} />;
  if (key === "delete") return <Trash2 size={13} />;
  return <Lock size={13} />;
}

// Module icon colours cycle through a palette
const modulePalette = [
  { bg: "bg-blue-100",   icon: "text-blue-600"   },
  { bg: "bg-indigo-100", icon: "text-indigo-600" },
  { bg: "bg-green-100",  icon: "text-green-600"  },
  { bg: "bg-orange-100", icon: "text-orange-600" },
  { bg: "bg-purple-100", icon: "text-purple-600" },
  { bg: "bg-pink-100",   icon: "text-pink-600"   },
  { bg: "bg-teal-100",   icon: "text-teal-600"   },
  { bg: "bg-yellow-100", icon: "text-yellow-600" },
];

function PermissionList() {
  const dispatch = useDispatch();
  const { items: permissions, loading, deleteLoading } = useSelector((state) => state.permissions);
  const { can } = usePermissions();
  const hasActions = can("roles:update") || can("roles:delete");

  const [currentPage, setCurrentPage]     = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterModule, setFilterModule]   = useState("");
  const [filterAction, setFilterAction]   = useState("");
  const [openModuleFilter, setOpenModuleFilter] = useState(false);
  const [openActionFilter, setOpenActionFilter] = useState(false);

  const uniqueModules = [...new Set(permissions.map((p) => p.module))].filter(Boolean);
  const uniqueActions = [...new Set(permissions.map((p) => p.action))].filter(Boolean);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".module-filter")) setOpenModuleFilter(false);
      if (!e.target.closest(".action-filter")) setOpenActionFilter(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    const defer = async () => {
      await Promise.resolve();
      setCurrentPage(1);
    };
    defer();
  }, [searchTerm, filterModule, filterAction]);

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deletePermissionData(deleteTargetId)).unwrap();
      toast.success("Permission deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete permission");
    }
  };

  // Filter individual permissions first
  const filteredPermissions = permissions.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.module?.toLowerCase().includes(q) ||
      p.action?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q);
    const matchesModule = !filterModule || p.module === filterModule;
    const matchesAction = !filterAction || p.action === filterAction;
    return matchesSearch && matchesModule && matchesAction;
  });

  // Group by module
  const moduleMap = filteredPermissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
  const moduleEntries = Object.entries(moduleMap); // [ [moduleName, [perms...]], ... ]

  // Paginate by module card
  const totalPages   = Math.max(1, Math.ceil(moduleEntries.length / PAGE_SIZE));
  const safePage     = Math.min(currentPage, totalPages);
  const startIndex   = (safePage - 1) * PAGE_SIZE;
  const pagedModules = moduleEntries.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Permission?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this permission?
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
                  {deleteLoading ? "Deleting..." : "Delete Permission"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5 md:space-y-6 flex-1 flex flex-col">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Permissions Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage system permissions and access controls
            </p>
          </div>

          {can("roles:create") && (
            <Link
              to="/settings/permissions/add"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add Permission
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Permissions</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {permissions.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <Shield className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unique Modules</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {uniqueModules.length}
                </h2>
              </div>
              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <Layers className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unique Actions</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-orange-600">
                  {uniqueActions.length}
                </h2>
              </div>
              <div className="bg-orange-100 p-3 md:p-4 rounded-2xl">
                <Lock className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-md">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Module Filter */}
            <div className="relative w-full sm:w-auto module-filter">
              <button
                onClick={() => setOpenModuleFilter(!openModuleFilter)}
                className="w-full sm:w-auto flex items-center gap-2 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Shield size={16} />
                Module: {filterModule || "All"}
                <ChevronDown size={16} className={`ml-auto sm:ml-2 transition-transform ${openModuleFilter ? "rotate-180" : ""}`} />
              </button>
              {openModuleFilter && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => { setFilterModule(""); setOpenModuleFilter(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700"
                  >
                    All Modules
                  </button>
                  {uniqueModules.map((m) => (
                    <button
                      key={m}
                      onClick={() => { setFilterModule(m); setOpenModuleFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm transition-all ${filterModule === m ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Filter */}
            <div className="relative w-full sm:w-auto action-filter">
              <button
                onClick={() => setOpenActionFilter(!openActionFilter)}
                className="w-full sm:w-auto flex items-center gap-2 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Lock size={16} />
                Action: {filterAction || "All"}
                <ChevronDown size={16} className={`ml-auto sm:ml-2 transition-transform ${openActionFilter ? "rotate-180" : ""}`} />
              </button>
              {openActionFilter && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => { setFilterAction(""); setOpenActionFilter(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700"
                  >
                    All Actions
                  </button>
                  {uniqueActions.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setFilterAction(a); setOpenActionFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm transition-all ${filterAction === a ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear */}
            {(filterModule || filterAction) && (
              <button
                onClick={() => { setFilterModule(""); setFilterAction(""); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-all"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading permissions...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table — always renders with thead */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[180px]">
                        Module
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px]">
                        Action
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[200px]">
                        Code
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </th>
                      {hasActions && (
                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[100px]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.length === 0 ? (
                      <tr>
                        <td colSpan={hasActions ? 5 : 4} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Shield size={48} className="text-gray-300" />
                            <h2 className="text-xl font-bold text-slate-700 mt-4">
                              No Permissions Found
                            </h2>
                            <p className="text-gray-500 mt-1 text-sm">
                              {permissions.length === 0
                                ? "Start by adding your first permission"
                                : "No permissions match your current filters"}
                            </p>
                            {permissions.length === 0 && can("roles:create") && (
                              <Link
                                to="/settings/permissions/add"
                                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                              >
                                Add Permission
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPermissions.map((perm, idx) => {
                        const palette = modulePalette[
                          [...new Set(filteredPermissions.map((p) => p.module))].indexOf(perm.module) % modulePalette.length
                        ];
                        return (
                          <tr
                            key={perm.id}
                            className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                          >
                            {/* Module */}
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className={`${palette.bg} p-2 rounded-xl shrink-0`}>
                                  <Shield size={14} className={palette.icon} />
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">
                                  {perm.module}
                                </span>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="p-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${actionBadgeClass(perm.action)}`}>
                                <ActionIcon action={perm.action} />
                                {perm.action}
                              </span>
                            </td>

                            {/* Code */}
                            <td className="p-5">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                {perm.code}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="p-5">
                              <span className="text-sm text-slate-600">
                                {perm.description || <span className="text-gray-400">—</span>}
                              </span>
                            </td>

                            {/* Actions */}
                            {hasActions && (
                              <td className="p-5">
                                <div className="flex items-center gap-2">
                                  {can("roles:update") && (
                                    <Link
                                      to={`/settings/permissions/edit/${perm.id}`}
                                      className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                                      title="Edit"
                                    >
                                      <Pencil size={15} />
                                    </Link>
                                  )}
                                  {can("roles:delete") && (
                                    <button
                                      onClick={() => openDeleteModal(perm.id)}
                                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                                      title="Delete"
                                    >
                                      <Trash2 size={15} />
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

            {/* Mobile / Tablet — Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
              {filteredPermissions.length === 0 ? (
                <div className="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-100 py-16 flex flex-col items-center justify-center shadow-sm">
                  <Shield size={48} className="text-gray-300" />
                  <h2 className="text-xl font-bold text-slate-700 mt-4">
                    No Permissions Found
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    {permissions.length === 0
                      ? "Start by adding your first permission"
                      : "No permissions match your current filters"}
                  </p>
                  {permissions.length === 0 && can("roles:create") && (
                    <Link
                      to="/settings/permissions/add"
                      className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                    >
                      Add Permission
                    </Link>
                  )}
                </div>
              ) : (
                pagedModules.map(([moduleName, perms], idx) => {
                  const palette = modulePalette[idx % modulePalette.length];
                  return (
                    <motion.div
                      key={moduleName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`${palette.bg} p-3 rounded-2xl`}>
                            <Shield size={20} className={palette.icon} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{moduleName}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {perms.length} permission{perms.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions list */}
                      <div className="divide-y divide-slate-100">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-all duration-150"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${actionBadgeClass(perm.action)}`}>
                                <ActionIcon action={perm.action} />
                                {perm.action}
                              </span>
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg shrink-0">
                                {perm.code}
                              </span>
                              {perm.description && (
                                <span className="text-xs text-gray-400 truncate hidden sm:block">
                                  {perm.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-3">
                              {can("roles:update") && (
                                <Link
                                  to={`/settings/permissions/edit/${perm.id}`}
                                  className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </Link>
                              )}
                              {can("roles:delete") && (
                                <button
                                  onClick={() => openDeleteModal(perm.id)}
                                  className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, moduleEntries.length)} of {moduleEntries.length}
              </span>{" "}
              modules
            </p>

            <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default PermissionList;
