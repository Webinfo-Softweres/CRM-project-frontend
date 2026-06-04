import Pagination from "../../components/common/Pagination";
// src/pages/enquiries/EnquiryList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminLayout from "../../layouts/AdminLayout";

import {
  Plus,
  Search,
  Filter,
  Phone,
  Globe,
  Camera,
  Share2,
  ClipboardList,
  Clock3,

  MessageSquareMore,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";
import AnimatedTableBody from "../../components/animations/AnimatedTableBody";
import AnimatedTableRow from "../../components/animations/AnimatedTableRow";
import toast from "react-hot-toast";

import { Link, useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import {
  fetchEnquiries,
  deleteEnquiryData,
  updateEnquiryData,
} from "../../redux/enquirySlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchUsers } from "../../redux/userSlice";

const PAGE_SIZE = 5;

// Format date to readable format with time (12-hour AM/PM)
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

function EnquiryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const hasActions = can("enquiries:update") || can("enquiries:delete");
  const {
    items: enquiries,
    loading,
    error,
    deleteLoading,
    lastFetched: enquiriesLastFetched,
  } = useSelector((state) => state.enquiries);
  const { items: customers, lastFetched: customersLastFetched } = useSelector((state) => state.customers);
  const { items: users, lastFetched: usersLastFetched } = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Helper to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  // Helper to get customer phone by ID
  const getCustomerPhone = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.phone || "-";
  };

  // Helper to get staff name by ID or object
  const getStaffNameLocal = (assignedToField) => {
    if (typeof assignedToField === "object" && assignedToField !== null) {
      return assignedToField.name || assignedToField.email || "Not assigned";
    }
    const user = users.find((u) => String(u.id) === String(assignedToField));
    return user ? (user.name || user.email) : "Not assigned";
  };

  // Fetch users and customers once on mount
  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isUsersStale = !usersLastFetched || (Date.now() - usersLastFetched > CACHE_DURATION);
    const isCustomersStale = !customersLastFetched || (Date.now() - customersLastFetched > CACHE_DURATION);

    if (users.length === 0 || isUsersStale) {
      dispatch(fetchUsers());
    }
    if (customers.length === 0 || isCustomersStale) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, users.length, customers.length, usersLastFetched, customersLastFetched]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch enquiries from API when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    const CACHE_DURATION = 5 * 60 * 1000;
    const isEnquiriesStale = !enquiriesLastFetched || (Date.now() - enquiriesLastFetched > CACHE_DURATION);

    if (searchQuery || enquiries.length === 0 || isEnquiriesStale) {
      dispatch(fetchEnquiries(params));
    }
  }, [dispatch, searchQuery, enquiries.length, enquiriesLastFetched]);

  // Client-side filtering for status
  const filtered = enquiries.filter((item) => {
    return statusFilter === "All" || item.status === statusFilter;
  });

  const newEnquiries = enquiries.filter((item) => item.status === "New").length;

  const followupEnquiries = enquiries.filter(
    (item) => item.status === "Follow Up",
  ).length;

  const closedEnquiries = enquiries.filter(
    (item) => item.status === "Closed",
  ).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedEnquiries = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteEnquiryData(deleteTargetId)).unwrap();
      toast.success("Enquiry deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete enquiry");
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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Enquiry?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this enquiry?
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
                  {deleteLoading ? "Deleting..." : "Delete Enquiry"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedPage className="space-y-5 md:space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Enquiry Management
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage customer enquiries and follow-ups
            </p>
          </div>

          {can("enquiries:create") && (
            <Link
              to="/enquiries/add"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add Enquiry
            </Link>
          )}
        </div>

        {/* Stats */}
        <AnimatedPage className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Total */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Enquiries</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {enquiries.length}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <ClipboardList className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          {/* New */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div>
              <p className="text-gray-500 text-sm">New Enquiries</p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-orange-500">
                {newEnquiries}
              </h2>
            </div>
          </AnimatedCard>

          {/* Follow Up */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div>
              <p className="text-gray-500 text-sm">Follow Up</p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">
                {followupEnquiries}
              </h2>
            </div>
          </AnimatedCard>

          {/* Closed */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div>
              <p className="text-gray-500 text-sm">Closed</p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                {closedEnquiries}
              </h2>
            </div>
          </AnimatedCard>
        </AnimatedPage>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
          {/* Search Input */}
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-xs">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by customer, service..."
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
                <option value="New">New</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Closed">Closed</option>
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
            <p className="text-gray-500 font-medium">Loading enquiries...</p>
          </div>
        ) : (
          <>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[20%]">
                    Customer
                  </th>

                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[22%]">
                    Service
                  </th>

                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[10%]">
                    Source
                  </th>

                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[14%]">
                    Assigned
                  </th>

                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[10%]">
                    Status
                  </th>

                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[12%]">
                    Date
                  </th>

                  {hasActions && (
                    <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[12%]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <AnimatedTableBody>
                {paginatedEnquiries.map((enquiry) => (
                  <AnimatedTableRow
                    key={enquiry.id}
                    className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                  >
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                          {getCustomerName(enquiry.customer_id)?.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {getCustomerName(enquiry.customer_id)}
                          </h3>

                          <p className="text-sm text-gray-500 truncate">
                            {getCustomerPhone(enquiry.customer_id)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="p-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-700 truncate">
                          {enquiry.service_required}
                        </h3>
                      </div>
                    </td>

                        {/* Source */}
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm text-slate-700">
                        {enquiry.source === "Facebook" && (
                          <MessageSquareMore
                            size={15}
                            className="text-blue-600 flex-shrink-0"
                          />
                        )}

                        {enquiry.source === "Instagram" && (
                          <Camera
                            size={15}
                            className="text-pink-500 flex-shrink-0"
                          />
                        )}

                        {enquiry.source === "Website" && (
                          <Globe
                            size={15}
                            className="text-green-600 flex-shrink-0"
                          />
                        )}

                        {enquiry.source === "Call" && (
                          <Phone
                            size={15}
                            className="text-orange-500 flex-shrink-0"
                          />
                        )}

                        {enquiry.source === "Referral" && (
                          <Share2
                            size={15}
                            className="text-indigo-600 flex-shrink-0"
                          />
                        )}

                        <span className="truncate">{enquiry.source}</span>
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                        <MessageSquareMore
                          size={15}
                          className="flex-shrink-0"
                        />

                        <span className="truncate">
                          {getStaffNameLocal(enquiry.assigned_to)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={enquiry.status}
                          disabled={!can("enquiries:update")}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await dispatch(
                                updateEnquiryData({
                                  id: enquiry.id,
                                  enquiryData: { ...enquiry, status: newStatus },
                                }),
                              ).unwrap();
                              toast.success(`Status updated to ${newStatus}`);
                            } catch {
                              toast.error("Failed to update status");
                            }
                          }}
                          className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 w-full ${
                            !can("enquiries:update") ? "opacity-60 cursor-not-allowed" : ""
                          }
                          ${
                            enquiry.status === "New"
                              ? "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 focus:ring-orange-200 focus:border-orange-400"
                              : enquiry.status === "Follow Up"
                                ? "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                                : "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                          }`}
                        >
                          <option value="New" className="bg-white text-orange-700">New</option>
                          <option value="Follow Up" className="bg-white text-blue-700">Follow Up</option>
                          <option value="Closed" className="bg-white text-green-700">Closed</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
                          ${
                            enquiry.status === "New"
                              ? "text-orange-500"
                              : enquiry.status === "Follow Up"
                                ? "text-blue-500"
                                : "text-green-500"
                          }`}
                        />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(enquiry.created_at)}
                      </span>
                    </td>

                    {hasActions && (
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {can("enquiries:update") && (
                            <button
                              onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}
                              className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                          {can("enquiries:delete") && (
                            <button
                              onClick={() => openDeleteModal(enquiry.id)}
                              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                            >
                              <Trash2 size={15} />
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

          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center">
              <ClipboardList size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Enquiries Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Start by adding your first enquiry
              </p>
              <Link
                to="/enquiries/add"
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
              >
                Add Enquiry
              </Link>
            </div>
          )}
        </div>
      </div>

        {/* Mobile + Tablet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center">
              <ClipboardList size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Enquiries Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Start by adding your first enquiry
              </p>
              <Link
                to="/enquiries/add"
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
              >
                Add Enquiry
              </Link>
            </div>
          ) : (
            paginatedEnquiries.map((enquiry) => (
              <motion.div
              key={enquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                    {getCustomerName(enquiry.customer_id)?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {getCustomerName(enquiry.customer_id)}
                    </h3>

                    <p className="text-sm text-gray-500 truncate">
                      {getCustomerPhone(enquiry.customer_id)}
                    </p>
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <select
                    value={enquiry.status}
                    disabled={!can("enquiries:update")}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        await dispatch(
                          updateEnquiryData({
                            id: enquiry.id,
                            enquiryData: { ...enquiry, status: newStatus },
                          }),
                        ).unwrap();
                        toast.success(`Status updated to ${newStatus}`);
                      } catch {
                        toast.error("Failed to update status");
                      }
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-sm focus:ring-2 focus:ring-offset-1 ${
                      !can("enquiries:update") ? "opacity-60 cursor-not-allowed" : ""
                    }
                    ${
                      enquiry.status === "New"
                        ? "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 focus:ring-orange-200 focus:border-orange-400"
                        : enquiry.status === "Follow Up"
                          ? "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 focus:ring-blue-200 focus:border-blue-400"
                          : "border-green-300 bg-green-50 text-green-700 hover:border-green-400 focus:ring-green-200 focus:border-green-400"
                    }`}
                  >
                    <option value="New" className="bg-white text-orange-700">New</option>
                    <option value="Follow Up" className="bg-white text-blue-700">Follow Up</option>
                    <option value="Closed" className="bg-white text-green-700">Closed</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
                    ${
                      enquiry.status === "New"
                        ? "text-orange-500"
                        : enquiry.status === "Follow Up"
                          ? "text-blue-500"
                          : "text-green-500"
                    }`}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Service</p>

                  <p className="text-sm font-medium text-slate-700">
                    {enquiry.service_required}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MessageSquareMore size={15} />

                  {getStaffNameLocal(enquiry.assigned_to)}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock3 size={15} />

                  {formatDate(enquiry.created_at)}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                {can("enquiries:update") && (
                  <button
                    onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}
                    className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                )}

                {can("enquiries:delete") && (
                  <button
                    onClick={() => openDeleteModal(enquiry.id)}
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
            enquiries
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

export default EnquiryList;
