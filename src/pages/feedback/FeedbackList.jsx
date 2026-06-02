import Pagination from "../../components/common/Pagination";
// src/pages/feedback/FeedbackList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";

import { fetchFeedback, deleteFeedback } from "../../redux/feedbackSlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchProjects } from "../../redux/projectSlice";

import {
  Plus,
  Search,
  Filter,
  Star,
  MessageSquareText,
  FolderKanban,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 5;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={15}
          className={
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

function FeedbackList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const hasActions = can("feedback:update") || can("feedback:delete");

  const { items: feedback, loading, error, deleteLoading } = useSelector(
    (state) => state.feedback,
  );
  const { items: customers } = useSelector((state) => state.customers);
  const { items: projects } = useSelector((state) => state.projects);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openDeleteModal = (id) => setDeleteTargetId(id);
  const closeDeleteModal = () => setDeleteTargetId(null);

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteFeedback(deleteTargetId)).unwrap();
      toast.success("Feedback deleted successfully");
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete feedback");
    }
  };

  useEffect(() => {
    dispatch(fetchFeedback());
    dispatch(fetchCustomers());
    dispatch(fetchProjects());
  }, [dispatch]);

  const getCustomerName = (id) =>
    customers.find((c) => c.id === id)?.name || `Customer #${id}`;

  const getProjectName = (id) =>
    projects.find((p) => p.id === id)?.project_name || `Project #${id}`;

  // — Search filter
  const filtered = feedback.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      getCustomerName(f.customer_id).toLowerCase().includes(q) ||
      getProjectName(f.project_id).toLowerCase().includes(q) ||
      f.comments?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // — Stats derived from API data
  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
      : "—";

  const positiveCount = feedback.filter((f) => f.rating >= 4).length;
  const positivePercent =
    feedback.length > 0
      ? Math.round((positiveCount / feedback.length) * 100)
      : 0;

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
              <h2 className="text-2xl font-bold text-slate-800 text-center">Delete Feedback?</h2>
              <p className="text-gray-500 text-center mt-3 leading-relaxed">
                Are you sure you want to delete this customer feedback?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 transition-all px-5 py-3 rounded-2xl font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Trash2 size={16} />
                  {deleteLoading ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 flex-1 flex flex-col">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Customer Feedback
            </h1>
            <p className="text-gray-500 mt-1">
              Manage customer reviews and project feedback
            </p>
          </div>

          {can("feedback:create") && (
            <Link
              to="/feedback/add"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Add Feedback
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Feedback</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {feedback.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <MessageSquareText className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Rating</p>
                <h2 className="text-3xl font-bold mt-2 text-yellow-500">
                  {avgRating}
                </h2>
              </div>
              <div className="bg-yellow-100 p-4 rounded-2xl">
                <Star className="text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Positive Reviews</p>
                <h2 className="text-3xl font-bold mt-2 text-green-600">
                  {positivePercent}%
                </h2>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <TrendingUp className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full lg:w-96">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by customer, project or comment..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-100 transition">
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading feedback...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Desktop Table */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Project
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px]">
                      Rating
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Comments
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px]">
                      Date
                    </th>
                    {hasActions && (
                      <th className="text-center p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={hasActions ? 6 : 5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <MessageSquareText size={48} className="text-gray-300" />
                          <h2 className="text-xl font-bold text-slate-700 mt-4">
                            No Feedback Found
                          </h2>
                          <p className="text-gray-500 mt-1 text-sm mb-4">
                            {feedback.length === 0
                              ? "No customer feedback has been collected yet"
                              : "No feedback matches your search"}
                          </p>
                          {feedback.length === 0 && (
                            <Link
                              to="/feedback/add"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow transition-all text-sm"
                            >
                              <Plus size={16} />
                              Add Feedback
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((fb) => (
                      <tr
                        key={fb.id}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                      >
                        {/* Customer */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0 text-sm">
                              {getCustomerName(fb.customer_id).charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-sm">
                                {getCustomerName(fb.customer_id)}
                              </h3>
                              <p className="text-xs text-gray-400">Customer</p>
                            </div>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="p-5">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 w-fit">
                            <FolderKanban size={12} />
                            {getProjectName(fb.project_id)}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="p-5">
                          <StarRating rating={fb.rating} />
                        </td>

                        {/* Comments */}
                        <td className="p-5">
                          <span className="text-sm text-slate-600 line-clamp-2">
                            {fb.comments || <span className="text-gray-400">—</span>}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-5 text-sm text-slate-600 whitespace-nowrap">
                          {formatDate(fb.created_at)}
                        </td>

                        {/* Actions */}
                        {hasActions && (
                          <td className="p-5">
                            <div className="flex items-center gap-2 justify-center">
                              {can("feedback:update") && (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/feedback/edit/${fb.id}`)}
                                  className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                  title="Edit Feedback"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                              {can("feedback:delete") && (
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(fb.id)}
                                  className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                  title="Delete Feedback"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Mobile Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginated.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 py-16 flex flex-col items-center justify-center shadow-sm">
                <MessageSquareText size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Feedback Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm mb-4">
                  {feedback.length === 0
                    ? "No customer feedback has been collected yet"
                    : "No feedback matches your search"}
                </p>
                {feedback.length === 0 && (
                  <Link
                    to="/feedback/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow transition-all text-sm"
                  >
                    <Plus size={16} />
                    Add Feedback
                  </Link>
                )}
              </div>
            ) : (
              paginated.map((fb) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                        {getCustomerName(fb.customer_id).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {getCustomerName(fb.customer_id)}
                        </h3>
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit mt-0.5">
                          <FolderKanban size={10} />
                          {getProjectName(fb.project_id)}
                        </span>
                      </div>
                    </div>
                    <StarRating rating={fb.rating} />
                  </div>

                  {fb.comments && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-3">
                      {fb.comments}
                    </p>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatDate(fb.created_at)}
                    </p>

                    <div className="flex items-center gap-2">
                      {can("feedback:update") && (
                        <button
                          type="button"
                          onClick={() => navigate(`/feedback/edit/${fb.id}`)}
                          className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                          title="Edit Feedback"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {can("feedback:delete") && (
                        <button
                          type="button"
                          onClick={() => openDeleteModal(fb.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                          title="Delete Feedback"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length === 0
                  ? 0
                  : `${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filtered.length)} of ${filtered.length}`}
              </span>{" "}
              feedback
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

export default FeedbackList;
