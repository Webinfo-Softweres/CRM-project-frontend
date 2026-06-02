import Pagination from "../../components/common/Pagination";
// src/pages/quotations/QuotationList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";


// Format date only
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format time only (12-hour AM/PM)
const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

import {
  Plus,
  Search,
  Filter,
  FileText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  Info,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { fetchUsers } from "../../redux/userSlice";
import {
  fetchQuotations,
  deleteQuotationData,
  updateQuotationData,
  approveQuotationData,
  rejectQuotationData,
  confirmQuotationData,
} from "../../redux/quotationSlice";



function QuotationList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const hasActions = can("quotations:update") || can("quotations:delete");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    items: quotations,
    loading,
    error,
    deleteLoading,
  } = useSelector((state) => state.quotations);
  const { items: users } = useSelector((state) => state.users);
  const [deleteTargetId, setDeleteTargetId] = useState(null);



  // Helper to get staff name by ID or object from live users/response
  const getStaffNameLocal = (field) => {
    if (!field) return "—";
    if (typeof field === "object") {
      return field.name || field.email || "—";
    }
    const user = users.find((u) => String(u.id) === String(field));
    return user ? (user.name || user.email) : "—";
  };

  // Helper to update quotation status, approved_by, and approved_at
  const handleStatusChange = async (quote, newStatus) => {
    try {
      if (newStatus === "Approved") {
        await dispatch(approveQuotationData(quote.id)).unwrap();
      } else if (newStatus === "Rejected") {
        await dispatch(rejectQuotationData(quote.id)).unwrap();
      } else if (newStatus === "Confirmed") {
        await dispatch(confirmQuotationData(quote.id)).unwrap();
      } else {
        // Fallback for Draft / generic update
        const payload = {
          amount: Number(quote.amount),
          description: quote.description,
          status: newStatus,
        };
        await dispatch(
          updateQuotationData({
            id: quote.id,
            quotationData: payload,
          }),
        ).unwrap();
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  // Ensure quotations is always an array
  const quotationList = Array.isArray(quotations) ? quotations : [];

  // Client-side filtering for status
  const filtered = quotationList.filter((q) => {
    return statusFilter === "All" || q.status === statusFilter;
  });

  const totalAmount = filtered.reduce(
    (sum, q) => sum + Number(q.amount || 0),
    0
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Fetch users once on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch quotations from API when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchQuotations(params));
  }, [dispatch, searchQuery]);

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteQuotationData(deleteTargetId)).unwrap();
      toast.success("Quotation deleted successfully");
      closeDeleteModal();
    } catch (err) {
      toast.error(err || "Failed to delete quotation");
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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Quotation?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this quotation?
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
                  {deleteLoading ? "Deleting..." : "Delete Quotation"}
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
              Quotation Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage customer quotations and approvals
            </p>
          </div>

          {can("quotations:create") && (
            <Link
              to="/quotations/create"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Create Quotation
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Quotes</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {quotationList.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <FileText className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Draft</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-orange-500">
                  {quotationList.filter((q) => q.status === "Draft").length}
                </h2>
              </div>
              <div className="bg-orange-100 p-3 md:p-4 rounded-2xl">
                <Clock3 className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {quotationList.filter((q) => q.status === "Approved").length}
                </h2>
              </div>
              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <CheckCircle2 className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-indigo-600">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-indigo-100 p-3 md:p-4 rounded-2xl">
                <IndianRupee className="text-indigo-600" />
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
              placeholder="Search by title, description, status, or amount"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
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
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Confirmed">Confirmed</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>


          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading quotations...</p>
          </div>
        ) : !error ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Quotation
                    </th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created By
                    </th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Approved By
                    </th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    {hasActions && (
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                    >
                      {/* Quotation */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 text-sm">
                              #{quote.id}
                            </h3>
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
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                          <IndianRupee size={11} />
                          {Number(quote.amount).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Created By */}
                      <td className="p-4 text-sm text-slate-600">
                        {getStaffNameLocal(quote.created_by)}
                      </td>

                      {/* Approved By */}
                      <td className="p-4 text-sm text-slate-600">
                        {getStaffNameLocal(quote.approved_by)}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="relative w-[110px]">
                          <select
                            value={quote.status}
                            disabled={!can("quotations:update")}
                            onChange={(e) => handleStatusChange(quote, e.target.value)}
                            className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 w-full ${
                              !can("quotations:update") ? "opacity-60 cursor-not-allowed" : ""
                            }
                            ${
                              quote.status === "Draft"
                                ? "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 focus:ring-orange-200 focus:border-orange-400"
                                : quote.status === "Approved"
                                  ? "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                                  : quote.status === "Rejected"
                                    ? "border-red-300 bg-red-50 text-red-700 hover:border-red-400 focus:ring-red-200 focus:border-red-400"
                                    : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Confirmed">Confirmed</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
                            ${
                              quote.status === "Draft"
                                ? "text-orange-500"
                                : quote.status === "Approved"
                                  ? "text-green-500"
                                  : quote.status === "Rejected"
                                    ? "text-red-500"
                                    : "text-blue-500"
                            }`}
                          />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sm text-slate-600">
                        <div className="text-slate-600">{formatDate(quote.created_at)}</div>
                        <div className="text-xs text-slate-400">{formatTime(quote.created_at)}</div>
                      </td>

                      {hasActions && (
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {can("quotations:update") && (
                              <button
                                onClick={() => navigate(`/quotations/edit/${quote.id}`)}
                                className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            {can("quotations:delete") && (
                              <button
                                onClick={() => openDeleteModal(quote.id)}
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
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center">
                <FileText size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Quotations Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Start by creating your first quotation
                </p>
                <Link
                  to="/quotations/create"
                  className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                >
                  Create Quotation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center">
              <FileText size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Quotations Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Start by creating your first quotation
              </p>
              <Link
                to="/quotations/create"
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
              >
                Create Quotation
              </Link>
            </div>
          ) : (
            paginatedData.map((quote) => (
              <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800">
                      #{quote.id}
                    </h3>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-gray-500 truncate max-w-[150px]">
                        {quote.description || "-"}
                      </p>
                      {quote.description && quote.description.length > 20 && (
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

                <div className="relative w-[110px] flex-shrink-0">
                  <select
                    value={quote.status}
                    disabled={!can("quotations:update")}
                    onChange={(e) => handleStatusChange(quote, e.target.value)}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 w-full ${
                      !can("quotations:update") ? "opacity-60 cursor-not-allowed" : ""
                    }
                    ${
                      quote.status === "Draft"
                        ? "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 focus:ring-orange-200 focus:border-orange-400"
                        : quote.status === "Approved"
                          ? "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                          : quote.status === "Rejected"
                            ? "border-red-300 bg-red-50 text-red-700 hover:border-red-400 focus:ring-red-200 focus:border-red-400"
                            : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                    }`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
                    ${
                      quote.status === "Draft"
                        ? "text-orange-500"
                        : quote.status === "Approved"
                          ? "text-green-500"
                          : quote.status === "Rejected"
                            ? "text-red-500"
                            : "text-blue-500"
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1">
                    <IndianRupee size={12} />
                    {Number(quote.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created By</span>
                  <span className="text-slate-700 font-medium">
                    {getStaffNameLocal(quote.created_by)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Approved By</span>
                  <span className="text-slate-700 font-medium">
                    {getStaffNameLocal(quote.approved_by)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 pt-1 border-t border-slate-100 mt-2">
                  <Clock3 size={15} />
                  {formatDate(quote.created_at)} at {formatTime(quote.created_at)}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                {can("quotations:update") && (
                  <button
                    onClick={() => navigate(`/quotations/edit/${quote.id}`)}
                    className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                )}
                {can("quotations:delete") && (
                  <button
                    onClick={() => openDeleteModal(quote.id)}
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
                : `${startIndex + 1}–${Math.min(endIndex, filtered.length)} of ${filtered.length}`}
            </span>{" "}
            quotations
          </p>

          <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
        </div>
      </>
    ) : null}
      </div>
    </AdminLayout>
  );
}

export default QuotationList;
