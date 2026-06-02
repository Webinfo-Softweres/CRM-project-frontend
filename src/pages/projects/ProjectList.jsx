import Pagination from "../../components/common/Pagination";
// src/pages/projects/ProjectList.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import { fetchProjects, updateProjectData, deleteProjectData } from "../../redux/projectSlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchQuotations } from "../../redux/quotationSlice";

import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  PauseCircle,
  CalendarDays,
  ChevronDown,
  FileText,
  Info,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";
import AnimatedTableBody from "../../components/animations/AnimatedTableBody";
import AnimatedTableRow from "../../components/animations/AnimatedTableRow";

import { Link } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

import { PROJECT_STATUS } from "../../constants/projectStatus";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const PAGE_SIZE = 5;

function ProjectList() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const hasActions = can("projects:read") || can("projects:update") || can("projects:delete");
  const [currentPage, setCurrentPage] = useState(1);

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const projects = useSelector((state) => state.projects.items);
  const projectsLoading = useSelector((state) => state.projects.loading);
  const deleteLoading = useSelector((state) => state.projects.deleteLoading);
  const customers = useSelector((state) => state.customers.items);
  const customersLoading = useSelector((state) => state.customers.loading);
  const quotations = useSelector((state) => state.quotations.items);
  const quotationsLoading = useSelector((state) => state.quotations.loading);

  const isLoading = projectsLoading || customersLoading || quotationsLoading;

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchCustomers());
    dispatch(fetchQuotations());
  }, [dispatch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch projects when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchProjects(params));
  }, [dispatch, searchQuery]);

  const getCustomerLabel = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "—";
  };

  const projectList = Array.isArray(projects) ? projects : [];

  const filteredProjects = projectList.filter((p) => {
    return statusFilter === "All" || p.status === statusFilter;
  });

  const ongoingCount = filteredProjects.filter((p) => p.status === "Ongoing").length;
  const completedCount = filteredProjects.filter((p) => p.status === "Completed").length;
  const holdCount = filteredProjects.filter((p) => p.status === "Hold").length;

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteProjectData(deleteTargetId)).unwrap();
      toast.success("Project deleted successfully");
      const updatedLength = filteredProjects.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(updatedLength / PAGE_SIZE));
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete project");
    }
  };

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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Project?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this project?
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
                  {deleteLoading ? "Deleting..." : "Delete Project"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedPage className="space-y-5 md:space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Project Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage projects linked to customers and approved quotations
            </p>
          </div>

          {can("projects:create") && (
            <Link
              to="/projects/create"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Create Project
            </Link>
          )}
        </div>

        {/* Stats */}
        <AnimatedPage className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Projects</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {filteredProjects.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <FolderKanban className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ongoing</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {ongoingCount}
                </h2>
              </div>
              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <CalendarDays className="text-green-600" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">
                  {completedCount}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <CheckCircle2 className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">On Hold</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-yellow-600">
                  {holdCount}
                </h2>
              </div>
              <div className="bg-yellow-100 p-3 md:p-4 rounded-2xl">
                <PauseCircle className="text-yellow-600" />
              </div>
            </div>
          </AnimatedCard>
        </AnimatedPage>

        {/* Search & Filter */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
          {/* Search Input */}
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-xs">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by project name, description, status, or client"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px] max-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="All">Status (All)</option>
                {PROJECT_STATUS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>


          </div>
        </div>
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading projects...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                       Project
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Quotation
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Start Date
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      End Date
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>
                    {hasActions && (
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <AnimatedTableBody>
                  {paginatedProjects.map((project) => (
                    <AnimatedTableRow
                      key={project.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                    >
                      {/* Project */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <FolderKanban size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {project.project_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Project #{project.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-5 text-sm text-slate-600">
                        {getCustomerLabel(project.customer_id)}
                      </td>

                      {/* Quotation */}
                      <td className="p-5">
                        {(() => {
                          const quote = quotations.find((q) => q.id === project.quotation_id);
                          return quote ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <FileText size={14} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-slate-800 text-sm">
                                  #{quote.id}
                                </h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {quote.description || "-"}
                                  </p>
                                  {quote.description && quote.description.length > 30 && (
                                    <span title={quote.description} className="flex shrink-0">
                                      <Info
                                        size={13}
                                        className="text-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                                      />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            "—"
                          );
                        })()}
                      </td>

                      {/* Start Date */}
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                           <CalendarDays size={14} />
                          {project.start_date}
                        </div>
                      </td>

                      {/* End Date */}
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={14} />
                          {project.end_date}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <div className="relative w-[120px]">
                          <select
                            value={project.status}
                            disabled={!can("projects:update")}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await dispatch(
                                  updateProjectData({
                                    id: project.id,
                                    projectData: {
                                      project_name: project.project_name,
                                      start_date: project.start_date || null,
                                      end_date: project.end_date || null,
                                      status: newStatus,
                                    },
                                  }),
                                ).unwrap();
                                toast.success(`Status updated to ${newStatus}`);
                              } catch {
                                toast.error("Failed to update status");
                              }
                            }}
                            className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 w-full ${
                              !can("projects:update") ? "opacity-60 cursor-not-allowed" : ""
                            }
                            ${
                              project.status === "Ongoing"
                                ? "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                                : project.status === "Completed"
                                ? "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                                : "border-yellow-300 bg-yellow-50 text-yellow-700 hover:border-yellow-400 focus:ring-yellow-200 focus:border-yellow-400"
                            }`}
                          >
                            {PROJECT_STATUS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                        </div>
                      </td>

                      {/* Created */}
                      <td className="p-5 text-sm text-slate-600">
                        <div className="text-slate-600">{formatDate(project.created_at)}</div>
                        <div className="text-xs text-slate-400">{formatTime(project.created_at)}</div>
                      </td>

                      {hasActions && (
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {can("projects:read") && (
                              <Link
                                to={`/projects/${project.id}`}
                                title="View"
                                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Eye size={16} />
                              </Link>
                            )}
                            {can("projects:update") && (
                              <Link
                                to={`/projects/edit/${project.id}`}
                                title="Edit"
                                className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Pencil size={16} />
                              </Link>
                            )}
                            {can("projects:delete") && (
                              <button
                                type="button"
                                title="Delete"
                                onClick={() => openDeleteModal(project.id)}
                                className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </AnimatedTableRow>
                  ))}
                </AnimatedTableBody>
              </table>
            </div>

            {filteredProjects.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center">
                <FolderKanban size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Projects Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Start by creating your first project
                </p>
                <Link
                  to="/projects/create"
                  className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                >
                  Create Project
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
          {filteredProjects.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center">
              <FolderKanban size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Projects Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Start by creating your first project
              </p>
              <Link
                to="/projects/create"
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
              >
                Create Project
              </Link>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <FolderKanban size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {project.project_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Project #{project.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {formatDate(project.created_at)} at {formatTime(project.created_at)}
                    </p>
                  </div>
                </div>

                {/* Status Dropdown on Mobile */}
                <div className="relative w-[110px] shrink-0">
                  <select
                    value={project.status}
                    disabled={!can("projects:update")}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        await dispatch(
                          updateProjectData({
                            id: project.id,
                            projectData: {
                              project_name: project.project_name,
                              start_date: project.start_date || null,
                              end_date: project.end_date || null,
                              status: newStatus,
                            },
                          }),
                        ).unwrap();
                        toast.success(`Status updated to ${newStatus}`);
                      } catch {
                        toast.error("Failed to update status");
                      }
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 w-full ${
                      !can("projects:update") ? "opacity-60 cursor-not-allowed" : ""
                    }
                    ${
                      project.status === "Ongoing"
                        ? "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                        : project.status === "Completed"
                        ? "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                        : "border-yellow-300 bg-yellow-50 text-yellow-700 hover:border-yellow-400 focus:ring-yellow-200 focus:border-yellow-400"
                    }`}
                  >
                    {PROJECT_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="text-slate-700 font-medium text-right max-w-[55%] truncate">
                    {getCustomerLabel(project.customer_id)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Quotation</span>
                  <span className="text-slate-700 font-medium text-right max-w-[55%] truncate">
                    {(() => {
                      const quote = quotations.find((q) => q.id === project.quotation_id);
                      return quote ? `#${quote.id} — ${quote.description || "-"}` : "—";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Start</span>
                  <span className="text-slate-700 font-medium">
                    {project.start_date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">End</span>
                  <span className="text-slate-700 font-medium">
                    {project.end_date}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Eye size={16} />
                  View
                </Link>
                {can("projects:update") && (
                  <Link
                    to={`/projects/edit/${project.id}`}
                    className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                )}
                {can("projects:delete") && (
                  <button
                    type="button"
                    onClick={() => openDeleteModal(project.id)}
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
              {filteredProjects.length === 0
                ? 0
                : `${startIndex + 1}–${Math.min(endIndex, filteredProjects.length)} of ${filteredProjects.length}`}
            </span>{" "}
            projects
          </p>

          <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
        </div>
      </>
    )}
      </AnimatedPage>
    </AdminLayout>
  );
}

export default ProjectList;
