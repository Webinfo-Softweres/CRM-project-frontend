// src/pages/feedback/FeedbackForm.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ArrowLeft,
  Save,
  Star,
  MessageSquareText,
  FolderKanban,
  User,
} from "lucide-react";

import { motion } from "framer-motion";
import { createFeedback, updateFeedback, fetchFeedback } from "../../redux/feedbackSlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchProjects } from "../../redux/projectSlice";

function FeedbackForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { items: feedback, loading: feedbackLoading, createLoading, updateLoading } = useSelector((state) => state.feedback);

  const existingFeedback = isEdit
    ? feedback.find((f) => String(f.id) === String(id))
    : null;

  const isLoading = createLoading || updateLoading;

  const [form, setForm] = useState({
    customer_id: "",
    project_id: "",
    rating: 0,
    comments: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers());
    }
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
    if (isEdit && feedback.length === 0) {
      dispatch(fetchFeedback());
    }
  }, [dispatch, customers.length, projects.length, isEdit, feedback.length]);

  // Load existing feedback details in edit mode
  useEffect(() => {
    if (isEdit && existingFeedback) {
      setForm({
        customer_id: existingFeedback.customer_id || "",
        project_id: existingFeedback.project_id || "",
        rating: existingFeedback.rating || 0,
        comments: existingFeedback.comments || "",
      });
    }
  }, [isEdit, existingFeedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Clear project_id if customer_id changes
      ...(name === "customer_id" ? { project_id: "" } : {}),
    }));
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1:
        return "⭐ Poor";
      case 2:
        return "⭐⭐ Fair";
      case 3:
        return "⭐⭐⭐ Good";
      case 4:
        return "⭐⭐⭐⭐ Very Good";
      case 5:
        return "⭐⭐⭐⭐⭐ Excellent!";
      default:
        return "Select rating level";
    }
  };

  const filteredProjects = projects.filter(
    (p) => String(p.customer_id) === String(form.customer_id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !form.customer_id) {
      toast.error("Please select a customer");
      return;
    }
    if (!isEdit && !form.project_id) {
      toast.error("Please select a project");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    try {
      if (isEdit) {
        const payload = {
          rating: Number(form.rating),
          comments: form.comments.trim(),
        };
        await dispatch(updateFeedback({ id: String(id), feedbackData: payload })).unwrap();
        toast.success("Feedback updated successfully");
      } else {
        const payload = {
          customer_id: Number(form.customer_id),
          project_id: Number(form.project_id),
          rating: Number(form.rating),
          comments: form.comments.trim(),
        };
        await dispatch(createFeedback(payload)).unwrap();
        toast.success("Feedback added successfully");
      }
      navigate("/feedback");
    } catch (err) {
      toast.error(err || "Failed to save feedback");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/feedback"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Feedback" : "Add New Feedback"}
              </h1>

              <p className="text-gray-500 mt-1 text-sm md:text-base">
                {isEdit
                  ? "Update feedback details"
                  : "Log and manage customer feedback details"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading Spinner for Edit Details */}
        {isEdit && feedbackLoading && feedback.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading feedback details...</p>
          </div>
        ) : (
          /* Form Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm p-5 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Feedback Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Feedback Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Customer {isEdit ? "" : "*"}
                    </label>

                    <div className={`flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 transition-all duration-200 ${
                      isEdit
                        ? "bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed"
                        : "focus-within:ring-2 focus-within:ring-blue-500"
                    }`}>
                      <User size={18} className="text-gray-400" />

                      <select
                        name="customer_id"
                        value={form.customer_id}
                        onChange={handleChange}
                        className="w-full ml-3 outline-none bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        required
                        disabled={isEdit}
                      >
                        <option value="" disabled>
                          {customersLoading ? "Loading customers..." : "Select customer"}
                        </option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} {customer.company_name ? `— ${customer.company_name}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Project {isEdit ? "" : "*"}
                    </label>

                    <div
                      className={`flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 transition-all duration-200 ${
                        !form.customer_id || isEdit
                          ? "bg-gray-50 border-gray-200 opacity-75 cursor-not-allowed"
                          : "focus-within:ring-2 focus-within:ring-blue-500"
                      }`}
                    >
                      <FolderKanban size={18} className="text-gray-400" />

                      <select
                        name="project_id"
                        value={form.project_id}
                        onChange={handleChange}
                        className="w-full ml-3 outline-none bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        required
                        disabled={!form.customer_id || isEdit}
                      >
                        <option value="" disabled>
                          {!form.customer_id
                            ? "Select customer first"
                            : projectsLoading
                            ? "Loading projects..."
                            : filteredProjects.length === 0
                            ? "No projects found for this customer"
                            : "Select project"}
                        </option>
                        {isEdit && existingFeedback ? (
                          <option value={existingFeedback.project_id}>
                            {projects.find((p) => p.id === existingFeedback.project_id)?.project_name || `Project #${existingFeedback.project_id}`}
                          </option>
                        ) : (
                          filteredProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.project_name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Rating *
                </label>
                <div className="flex items-center gap-4 flex-wrap mt-1">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform active:scale-90 duration-100 hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={`transition-colors duration-150 ${
                            star <= (hoverRating || form.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-4 py-2.5 rounded-2xl">
                    {getRatingLabel(hoverRating || form.rating)}
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Comments
                </label>

                <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                  <MessageSquareText size={18} className="text-gray-400 mt-1" />

                  <textarea
                    rows="5"
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                    placeholder="Describe your review, client satisfaction details, or notes..."
                    className="w-full ml-3 outline-none bg-transparent resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <Link
                  to="/feedback"
                  className="w-full sm:w-fit px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all text-center font-medium text-slate-700"
                >
                  Cancel
                </Link>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-fit bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg font-medium cursor-pointer"
                >
                  <Save size={18} />
                  {isLoading
                    ? "Saving..."
                    : isEdit
                      ? "Update Feedback"
                      : "Save Feedback"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}

export default FeedbackForm;
