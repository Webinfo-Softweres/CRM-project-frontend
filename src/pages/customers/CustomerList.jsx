import Pagination from "../../components/common/Pagination";
// CustomerList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminLayout from "../../layouts/AdminLayout";

import {
  fetchCustomers,
  updateCustomerData,
  deleteCustomerData,
} from "../../redux/customerSlice";

import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  Building2,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { Link, useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";
import AnimatedTableBody from "../../components/animations/AnimatedTableBody";
import AnimatedTableRow from "../../components/animations/AnimatedTableRow";

const PAGE_SIZE = 5;

// Format helper functions for separate date and time lines
const formatCustomerDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "";
  }
};

const formatCustomerTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return "";
  }
};

function CustomerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const hasActions = can("customers:update") || can("customers:delete");
  const {
    items: customers,
    loading,
    error,
    deleteLoading,
    lastFetched: customersLastFetched,
  } = useSelector((state) => state.customers);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch customers from API when searchQuery changes (API for search only)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    const CACHE_DURATION = 5 * 60 * 1000;
    const isCustomersStale = !customersLastFetched || (Date.now() - customersLastFetched > CACHE_DURATION);

    if (searchQuery || customers.length === 0 || isCustomersStale) {
      dispatch(fetchCustomers(params));
    }
  }, [dispatch, searchQuery, customers.length, customersLastFetched]);

  // Client-side filtering for status
  const filtered = customers.filter((c) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && c.status === "Active") ||
      (statusFilter === "Inactive" && c.status === "Inactive");

    return matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedCustomers = filtered.slice(startIndex, endIndex);


  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toggleStatus = async (id) => {
    const customer = customers.find((item) => item.id === id);

    if (!customer) return;

    const newStatus = customer.status === "Active" ? "Inactive" : "Active";

    await dispatch(
      updateCustomerData({
        id,
        customerData: {
          status: newStatus,
        },
      }),
    );
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteCustomerData(deleteTargetId)).unwrap();
      toast.success("Customer deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete customer");
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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Customer?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this customer?
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
                  {deleteLoading ? "Deleting..." : "Delete Customer"}
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
              Customer Management
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage customers, companies and client relationships
            </p>
          </div>

          {can("customers:create") && (
            <Link
              to="/customers/add"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add Customer
            </Link>
          )}
        </div>

        {/* Stats */}
        <AnimatedPage className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Total Customers */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Customers</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {customers.length}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          {/* Active Customers */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Customers</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {
                    customers.filter((customer) => customer.status === "Active")
                      .length
                  }
                </h2>
              </div>

              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-green-600" />
              </div>
            </div>
          </AnimatedCard>

          {/* Companies */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Companies</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {customers.length}
                </h2>
              </div>

              <div className="bg-orange-100 p-3 md:p-4 rounded-2xl">
                <Building2 className="text-orange-600" />
              </div>
            </div>
          </AnimatedCard>

          {/* Inactive */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactive Customers</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-red-600">
                  {
                    customers.filter(
                      (customer) => customer.status === "Inactive",
                    ).length
                  }
                </h2>
              </div>

              <div className="bg-red-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-red-600" />
              </div>
            </div>
          </AnimatedCard>
        </AnimatedPage>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          {/* Search Input */}
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full md:w-96">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, company, email, phone or address..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-12 py-3 outline-none bg-white text-sm cursor-pointer w-full md:w-auto font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
            />
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
            <p className="text-gray-500 font-medium">Loading customers...</p>
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
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[24%]">
                      Customer
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Company
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[24%]">
                      Contact
                    </th>

                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[24%]">
                      Address
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

                <AnimatedTableBody>
                  {paginatedCustomers.map((customer) => (
                    <AnimatedTableRow
                      key={customer.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                    >
                      {/* Customer */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                            {customer.name?.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800">
                              {customer.name}
                            </h3>

                             <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                               <span className="font-medium text-slate-500">{formatCustomerDate(customer.created_at)}</span>
                               <span className="text-xs text-slate-500 font-medium">{formatCustomerTime(customer.created_at)}</span>
                             </div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-5">
                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap">
                          {customer.company_name}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="p-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                            <Mail size={14} />
                            <span className="break-all">{customer.email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="p-5">
                        <p className="text-sm text-slate-600">
                          {customer.address}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <button
                          onClick={() => can("customers:update") && toggleStatus(customer.id)}
                          disabled={!can("customers:update")}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            !can("customers:update") ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                          } ${
                            customer.status === "Active"
                              ? "bg-green-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                              customer.status === "Active"
                                ? "left-6"
                                : "left-0.5"
                            }`}
                          ></div>
                        </button>
                      </td>

                      {hasActions && (
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {can("customers:update") && (
                              <button
                                onClick={() => navigate(`/customers/edit/${customer.id}`)}
                                className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {can("customers:delete") && (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(customer.id)}
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

            {customers.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center">
                <Users size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Customers Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Start by adding your first customer
                </p>
                <Link
                  to="/customers/add"
                  className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                >
                  Add Customer
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
          {customers.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center">
              <Users size={48} className="text-gray-300" />
              <h2 className="text-xl font-bold text-slate-700 mt-4">
                No Customers Found
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Start by adding your first customer
              </p>
              <Link
                to="/customers/add"
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
              >
                Add Customer
              </Link>
            </div>
          ) : (
            paginatedCustomers.map((customer) => (
              <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md text-base md:text-lg flex-shrink-0">
                    {customer.name?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {customer.name}
                    </h3>

                     <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                       <span className="font-medium text-slate-500">{formatCustomerDate(customer.created_at)}</span>
                       <span className="text-xs text-slate-500 font-medium">{formatCustomerTime(customer.created_at)}</span>
                     </div>
                  </div>
                </div>

                  <button
                    onClick={() => can("customers:update") && toggleStatus(customer.id)}
                    disabled={!can("customers:update")}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                      !can("customers:update") ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      customer.status === "Active"
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                        customer.status === "Active" ? "left-6" : "left-0.5"
                      }`}
                    ></div>
                  </button>
              </div>

              {/* Info */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 size={15} className="flex-shrink-0" />
                  {customer.company_name}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 break-all">
                  <Phone size={15} className="flex-shrink-0" />
                  {customer.phone}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 break-all">
                  <Mail size={15} className="flex-shrink-0" />
                  {customer.email}
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 text-sm text-slate-600">
                  {customer.address}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                {can("customers:update") && (
                  <button
                    onClick={() => navigate(`/customers/edit/${customer.id}`)}
                    className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                )}

                {can("customers:delete") && (
                  <button
                    type="button"
                    onClick={() => openDeleteModal(customer.id)}
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
              {customers.length === 0
                ? 0
                : `${startIndex + 1}-${Math.min(endIndex, customers.length)} of ${customers.length}`}
            </span>{" "}
            customers
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

export default CustomerList;
