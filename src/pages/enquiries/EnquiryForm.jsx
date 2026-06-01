// src/pages/enquiries/EnquiryForm.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminLayout from "../../layouts/AdminLayout";

import {
  ArrowLeft,
  Save,
  User,
  ClipboardList,
  MessageSquareText,
  Globe,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCustomers } from "../../redux/customerSlice";
import { fetchUsers } from "../../redux/userSlice";
import {
  createEnquiry,
  updateEnquiryData,
  fetchEnquiries,
  clearEnquiryError,
} from "../../redux/enquirySlice";

function EnquiryForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { items: customers, loading: customersLoading } = useSelector(
    (state) => state.customers,
  );
  const { items: users, loading: usersLoading } = useSelector(
    (state) => state.users,
  );
  const {
    items: enquiries,
    createLoading,
    updateLoading,
    createError,
    updateError,
  } = useSelector((state) => state.enquiries);

  const [form, setForm] = useState({
    customer_id: "",
    source: "",
    service_required: "",
    description: "",
    status: "New",
    assigned_to: "",
  });

  const existingEnquiry = isEdit
    ? enquiries.find((e) => String(e.id) === String(id))
    : null;
  const isLoading = createLoading || updateLoading;
  const error = createError || updateError;

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchUsers());
    if (isEdit && enquiries.length === 0) {
      dispatch(fetchEnquiries());
    }
  }, [dispatch, isEdit, enquiries.length]);

  // Load enquiry data when editing
  useEffect(() => {
    if (isEdit && existingEnquiry) {
      setForm({
        customer_id: String(existingEnquiry.customer_id) || "",
        source: existingEnquiry.source || "",
        service_required: existingEnquiry.service_required || "",
        description: existingEnquiry.description || "",
        status: existingEnquiry.status || "New",
        assigned_to: existingEnquiry.assigned_to
          ? (typeof existingEnquiry.assigned_to === "object"
              ? String(existingEnquiry.assigned_to.id)
              : String(existingEnquiry.assigned_to))
          : "",
      });
    }
  }, [isEdit, existingEnquiry]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (error) dispatch(clearEnquiryError());

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleStatusChange = (status) => {
    setForm((currentForm) => ({
      ...currentForm,
      status,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      customer_id: Number(form.customer_id),
      source: form.source,
      service_required: form.service_required,
      description: form.description,
      status: form.status,
      assigned_to: Number(form.assigned_to),
    };

    try {
      if (isEdit) {
        await dispatch(
          updateEnquiryData({ id: String(id), enquiryData: payload }),
        ).unwrap();
        toast.success("Enquiry updated successfully");
      } else {
        await dispatch(createEnquiry(payload)).unwrap();
        toast.success("Enquiry created successfully");
      }
      navigate("/enquiries");
    } catch {
      toast.error("Failed to save enquiry");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/enquiries"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Enquiry" : "Add New Enquiry"}
              </h1>

              <p className="text-gray-500 mt-1">
                {isEdit
                  ? "Update customer enquiry details"
                  : "Create customer enquiry and assign staff"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Select Customer *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <User size={18} className="text-gray-400" />

                    <select
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      required
                      disabled={isEdit}
                      className="w-full ml-3 outline-none bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {customersLoading ? "Loading customers..." : "Select customer"}
                      </option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enquiry Source *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Globe size={18} className="text-gray-400" />

                    <select
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    >
                      <option value="">Select source</option>
                      <option value="Website">Website</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Call">Call</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>
                </div>

                {/* Service */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Service Required *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <ClipboardList size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="service_required"
                      value={form.service_required}
                      onChange={handleChange}
                      placeholder="Enter required service"
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Assign Staff */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Assign Staff *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Users size={18} className="text-gray-400" />

                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    >
                      <option value="">
                        {usersLoading ? "Loading staff..." : "Select staff"}
                      </option>

                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Requirement Details
              </h2>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>

                <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <MessageSquareText size={18} className="text-gray-400 mt-1" />

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Enter enquiry details..."
                    className="w-full ml-3 outline-none bg-transparent resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Enquiry Status
              </h2>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleStatusChange("New")}
                  className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                    form.status === "New"
                      ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  New
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Follow Up")}
                  className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                    form.status === "Follow Up"
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  Follow Up
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Closed")}
                  className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                    form.status === "Closed"
                      ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            {createError || updateError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                {createError || updateError}
              </div>
            ) : null}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link
                to="/enquiries"
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <Save size={18} />
                {isLoading
                  ? "Saving..."
                  : isEdit
                    ? "Update Enquiry"
                    : "Save Enquiry"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default EnquiryForm;
