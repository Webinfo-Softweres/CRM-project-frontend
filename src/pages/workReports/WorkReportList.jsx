// src/pages/workReports/WorkReportList.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";

import { fetchWorkReports, deleteWorkReportData } from "../../redux/workReportSlice";
import { fetchUsers } from "../../redux/userSlice";

import {
  CalendarDays,
  Clock3,
  ClipboardCheck,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

function WorkReportList() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const hasActions = can("reports:update") || can("reports:delete");
  const { items: reports, loading, error, deleteLoading } = useSelector((state) => state.workReports);
  const users = useSelector((state) => state.users.items);
  const usersLoading = useSelector((state) => state.users.loading);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch work reports when searchQuery or reportDate changes
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (reportDate) params.report_date = reportDate;
    dispatch(fetchWorkReports(params));
  }, [dispatch, searchQuery, reportDate]);

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : `User #${userId}`;
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteWorkReportData(deleteTargetId)).unwrap();
      toast.success("Work report deleted successfully");
      closeDeleteModal();
    } catch (err) {
      toast.error(err || "Failed to delete work report");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const totalHours = reports.reduce(
    (sum, report) => sum + Number(report.total_hours || 0),
    0,
  );

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(reports.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = reports.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Work Report?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this report?
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
                  {deleteLoading ? "Deleting..." : "Delete Report"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5 md:space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Work Reports
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-1">
              Track staff daily work and productivity
            </p>
          </div>

          {can("reports:create") && (
            <Link
              to="/work-reports/create"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add Report
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Reports</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
                  {reports.length}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 md:p-4 rounded-2xl">
                <ClipboardCheck className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Staff</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                  {users.length}
                </h2>
              </div>

              <div className="bg-green-100 p-3 md:p-4 rounded-2xl">
                <Users className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Hours</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-orange-500">
                  {totalHours}h
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
                <p className="text-gray-500 text-sm">Pending Reports</p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 text-red-600">
                  0
                </h2>
              </div>

              <div className="bg-red-100 p-3 md:p-4 rounded-2xl">
                <FileText className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-md">
            <Search size={18} className="text-gray-400 flex-shrink-0" />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by summary, total hours, or report date"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-initial min-w-[170px]">
              <input
                type="date"
                value={reportDate}
                onChange={(e) => {
                  setReportDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl px-5 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {reportDate && (
              <button
                onClick={() => {
                  setReportDate("");
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {loading || usersLoading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading reports...</p>
          </div>
        ) : (
          <>
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
                          Staff
                        </th>

                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Report Date
                        </th>

                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Summary
                        </th>

                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Total Hours
                        </th>

                        <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Created At
                        </th>

                        {hasActions && (
                          <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.map((report) => {
                        const name = report.staff || getUserName(report.user_id);
                        return (
                          <tr
                            key={report.id}
                            className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                          >
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                                  {name?.charAt(0)}
                                </div>

                                <div>
                                  <h3 className="font-semibold text-slate-800">
                                    {name}
                                  </h3>

                                  <p className="text-sm text-gray-500">Staff</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-5">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays size={14} />
                                {formatDate(report.report_date)}
                              </div>
                            </td>

                            <td className="p-5">
                              <p className="text-sm text-slate-600 max-w-sm leading-6">
                                {report.summary}
                              </p>
                            </td>

                            <td className="p-5">
                              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1">
                                <Clock3 size={12} />
                                {report.total_hours} hrs
                              </span>
                            </td>

                            <td className="p-5 text-sm text-slate-600">
                              {formatDateTime(report.created_at)}
                            </td>

                            {hasActions && (
                              <td className="p-5">
                                <div className="flex items-center gap-2">
                                  {can("reports:update") && (
                                    <Link to={`/work-reports/edit/${report.id}`} className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200">
                                      <Pencil size={16} />
                                    </Link>
                                  )}

                                  {can("reports:delete") && (
                                    <button
                                      onClick={() => openDeleteModal(report.id)}
                                      className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {reports.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <ClipboardCheck size={48} className="text-gray-300" />
                    <h2 className="text-xl font-bold text-slate-700 mt-4">
                      No Work Reports Found
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                      Start by creating your first work report
                    </p>
                    <Link
                      to="/work-reports/create"
                      className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                    >
                      Add Report
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:hidden">
              {reports.length === 0 ? (
                <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center animate-fade-in">
                  <ClipboardCheck size={48} className="text-gray-300" />
                  <h2 className="text-xl font-bold text-slate-700 mt-4">
                    No Work Reports Found
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Start by creating your first work report
                  </p>
                  <Link
                    to="/work-reports/create"
                    className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm"
                  >
                    Add Report
                  </Link>
                </div>
              ) : (
                paginatedData.map((report) => {
                const name = report.staff || getUserName(report.user_id);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md text-base md:text-lg flex-shrink-0">
                          {name?.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {name}
                          </h3>

                          <p className="text-sm text-gray-500 truncate">
                            {formatDate(report.report_date)}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Added on {formatDateTime(report.created_at)}
                          </p>
                        </div>
                      </div>

                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 flex-shrink-0">
                        <Clock3 size={12} />
                        {report.total_hours} hrs
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays size={15} className="flex-shrink-0" />
                        {formatDate(report.report_date)}
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3 text-sm text-slate-600 leading-6">
                        {report.summary}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      {can("reports:update") && (
                        <Link to={`/work-reports/edit/${report.id}`} className="flex-1 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200">
                          <Pencil size={16} />
                          Edit
                        </Link>
                      )}

                      {can("reports:delete") && (
                        <button
                          onClick={() => openDeleteModal(report.id)}
                          className="flex-1 h-11 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }))}
            </div>

            {/* Pagination Controls */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {reports.length === 0
                    ? 0
                    : `${startIndex + 1}–${Math.min(endIndex, reports.length)} of ${reports.length}`}
                </span>{" "}
                reports
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      safePage === page
                        ? "bg-blue-600 text-white shadow"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}

export default WorkReportList;
