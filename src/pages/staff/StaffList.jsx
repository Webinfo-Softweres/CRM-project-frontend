import Pagination from "../../components/common/Pagination";
// UsersList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminLayout from "../../layouts/AdminLayout";

import { fetchUsers, updateUserData, deleteUserData } from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { fetchRoles } from "../../redux/roleSlice";

import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  ShieldCheck,
  Building2,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

const PAGE_SIZE = 5;

function UsersList() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const hasActions = can("users:update") || can("users:delete");
  const { items: users, loading, error, deleteLoading } = useSelector((state) => state.users);
  const { items: roles } = useSelector((state) => state.roles);
  const { items: departments } = useSelector((state) => state.departments);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch roles and departments once on mount
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users from API when search query changes (API for search only)
  useEffect(() => {
    const params = {
      search: searchQuery,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, searchQuery]);

  // Client-side filtering for role, department, status
  const filtered = users.filter((user) => {
    const matchesRole =
      roleFilter === "All" || user.role_id === Number(roleFilter);

    const matchesDept =
      deptFilter === "All" || user.department_id === Number(deptFilter);

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesRole && matchesDept && matchesStatus;
  });

  const getRoleName = (roleId) =>
    roles.find((role) => role.id === roleId)?.role_name || "Not assigned";

  const getDepartmentName = (departmentId) =>
    departments.find((dept) => dept.id === departmentId)?.name || "Not assigned";

  const getJoinedDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Not available";

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  

  const toggleStatus = async (id) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;

    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      await dispatch(updateUserData({ id, userData: { status: newStatus } })).unwrap();
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteUserData(deleteTargetId)).unwrap();
      toast.success("User deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete user");
    }
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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete User?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this user?
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
                  {deleteLoading ? "Deleting..." : "Delete User"}
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
              User Management
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage users, roles, departments and permissions
            </p>
          </div>

          {can("users:create") && (
            <Link
              to="/staff/add"
              className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add User
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {users.length}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Roles</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {roles.length}
                </h2>
              </div>

              <div className="bg-purple-100 p-3 md:p-4 rounded-2xl">
                <ShieldCheck className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Departments</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {departments.length}
                </h2>
              </div>

              <div className="bg-orange-100 p-3 md:p-4 rounded-2xl">
                <Building2 className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {users.filter((user) => user.status === "Active").length}
                </h2>
              </div>

              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
          {/* Search Input */}
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-xs">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone or bio ID..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Role Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700"
              >
                <option value="All">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {/* Department Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </div>

        {error && users.length === 0 ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading users...</p>
          </div>
        ) : (
          <>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div>
              <table className="w-full table-auto">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[28%]">
                      User
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Role
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Department
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[28%]">
                      Contact
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Status
                    </th>

                    {hasActions && (
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                            {user.name.charAt(0)}
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {user.name}
                            </h3>

                            <p className="text-sm text-gray-500 break-all">
                              Bio ID: {user.biometric_id || "—"}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              Joined on {getJoinedDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap">
                          {getRoleName(user.role_id)}
                        </span>
                      </td>

                      <td className="p-5">
                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap">
                          {getDepartmentName(user.department_id)}
                        </span>
                      </td>

                      <td className="p-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                            <Mail size={14} />
                            <span className="break-all">{user.email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} />
                            {user.phone}
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <button
                          onClick={() => can("users:update") && toggleStatus(user.id)}
                          disabled={!can("users:update")}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            !can("users:update") ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                          } ${
                            user.status === "Active"
                              ? "bg-green-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                              user.status === "Active" ? "left-6" : "left-0.5"
                            }`}
                          ></div>
                        </button>
                      </td>

                      {hasActions && (
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {can("users:update") && (
                              <Link
                                to={`/staff/edit/${user.id}`}
                                className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Pencil size={16} />
                              </Link>
                            )}

                            {can("users:delete") && (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(user.id)}
                                className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center">
                <Users size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Users Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  {users.length === 0
                    ? "Start by adding your first user"
                    : "No users match your filters"}
                </p>
                {users.length === 0 && (
                  <Link
                    to="/staff/add"
                    className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                  >
                    Add User
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center">
              <Users size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Users Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {users.length === 0
                  ? "Start by adding your first user"
                  : "No users match your filters"}
              </p>
              {users.length === 0 && (
                <Link
                  to="/staff/add"
                  className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                >
                  Add User
                </Link>
              )}
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md text-base md:text-lg shrink-0">
                    {user.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {user.name}
                    </h3>

                    <p className="text-sm text-gray-500 truncate">
                      Bio ID: {user.biometric_id || "—"}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Joined on {getJoinedDate(user.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => can("users:update") && toggleStatus(user.id)}
                  disabled={!can("users:update")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                    !can("users:update") ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    user.status === "Active" ? "bg-green-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                      user.status === "Active" ? "left-6" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Info */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 break-all">
                  <Phone size={15} className="shrink-0" />
                  {user.phone}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl text-xs font-semibold">
                    {getRoleName(user.role_id)}
                  </span>

                  <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-xl text-xs font-semibold">
                    {getDepartmentName(user.department_id)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                {can("users:update") && (
                  <Link
                    to={`/staff/edit/${user.id}`}
                    className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                )}

                {can("users:delete") && (
                  <button
                    type="button"
                    onClick={() => openDeleteModal(user.id)}
                    className="flex-1 h-11 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          )))}
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length === 0
                ? 0
                : `${startIndex + 1}-${Math.min(endIndex, filtered.length)} of ${filtered.length}`}
            </span>{" "}
            users
          </p>

          <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
        </div>
      </>
    )}
      </div>
    </AdminLayout>
  );
}

export default UsersList;
