// src/pages/quotations/QuotationForm.jsx
// Shared form for both Create and Edit

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";

import {
  ArrowLeft,
  Save,
  IndianRupee,
  User,
  ClipboardList,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { fetchEnquiries } from "../../redux/enquirySlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchUsers } from "../../redux/userSlice";
import {
  fetchQuotations,
  updateQuotationData,
  createQuotationData,
} from "../../redux/quotationSlice";


const emptyForm = {
  enquiry_id: "",
  amount: "",
  description: "",
  status: "Draft",
};

function QuotationForm() {
  const { id } = useParams();           // present on edit, undefined on create
  const isEdit = Boolean(id);

  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const { items: quotations, updateLoading } = useSelector(
    (state) => state.quotations
  );
  const { items: enquiries } = useSelector((state) => state.enquiries);
  const { items: customers } = useSelector((state) => state.customers);
  const { items: users } = useSelector((state) => state.users);

  const getCustomerName = (enquiry) => {
    if (!enquiry) return "Unknown";
    if (enquiry.customer && typeof enquiry.customer === "object") {
      return enquiry.customer.name || enquiry.customer.company_name || "Unknown";
    }
    const customer = customers.find((c) => c.id === enquiry.customer_id);
    return customer ? `${customer.name} (${customer.company_name})` : "Unknown";
  };

  // Resolve logged-in user from the cookie token
  const token = Cookies.get("access_token");
  let loggedInUser = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedInUser = users.find(
        (u) =>
          String(u.id) === String(decoded.sub) ||
          String(u.id) === String(decoded.id) ||
          u.email === decoded.sub ||
          u.username === decoded.sub
      );
    } catch (e) {
      console.error("Error decoding auth token:", e);
    }
  }


  const [form, setForm] = useState(emptyForm);

  // Fetch enquiries, customers, and users on mount
  useEffect(() => {
    dispatch(fetchEnquiries());
    dispatch(fetchCustomers());
    dispatch(fetchUsers());
  }, [dispatch]);

  // On edit — load existing quotation into form
  useEffect(() => {
    if (!isEdit) return;

    // If slice is empty (direct URL access), fetch first
    if (quotations.length === 0) {
      dispatch(fetchQuotations());
      return;
    }

    const existing = quotations.find((q) => String(q.id) === String(id));
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        enquiry_id: existing.enquiry_id
          ? (typeof existing.enquiry_id === "object"
              ? String(existing.enquiry_id.id)
              : String(existing.enquiry_id))
          : "",
        amount:      existing.amount      ?? "",
        description: existing.description ?? "",
        status:      existing.status      ?? "Draft",
      });
    }
  }, [isEdit, id, quotations, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status) => {
    setForm((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !form.enquiry_id) {
      toast.error("Please select an enquiry");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      if (isEdit) {
        const payload = {
          amount: Number(form.amount),
          description: form.description || "",
          status: form.status,
        };
        await dispatch(
          updateQuotationData({ id: Number(id), quotationData: payload })
        ).unwrap();
        toast.success("Quotation updated successfully");
      } else {
        const payload = {
          enquiry_id: Number(form.enquiry_id),
          amount: Number(form.amount),
          description: form.description || "",
          status: form.status,
          created_by: loggedInUser?.id || null,
        };
        await dispatch(createQuotationData(payload)).unwrap();
        toast.success("Quotation created successfully");
      }
      navigate("/quotations");
    } catch (err) {
      toast.error(err || (isEdit ? "Failed to update" : "Failed to create"));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/quotations"
            className="bg-white border border-slate-200 shadow-sm p-3 rounded-2xl hover:bg-slate-100 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {isEdit ? "Edit Quotation" : "Create Quotation"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? `Editing quotation #${id}`
                : "Generate a quotation for an enquiry"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enquiry */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Enquiry
              </label>
              <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <User size={18} className="text-gray-400 shrink-0" />
                <select
                  name="enquiry_id"
                  value={form.enquiry_id}
                  onChange={handleChange}
                  disabled={isEdit}
                  className="w-full ml-3 outline-none bg-transparent text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="">Select enquiry</option>
                  {enquiries.map((enquiry) => (
                    <option key={enquiry.id} value={enquiry.id}>
                      #{enquiry.id} — {getCustomerName(enquiry)} · {enquiry.service_required}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Quotation Amount
              </label>
              <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <IndianRupee size={18} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="0"
                  required
                  className="w-full ml-3 outline-none bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Description / Scope of Work */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Scope of Work
              </label>
              <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <ClipboardList size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the scope of work..."
                  className="w-full ml-3 outline-none bg-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Quotation Status
              </h2>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleStatusChange("Draft")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    form.status === "Draft"
                      ? "bg-slate-100 text-slate-700 ring-2 ring-slate-300"
                      : "bg-gray-100 text-gray-700 hover:bg-slate-50"
                  }`}
                >
                  Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Approved")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    form.status === "Approved"
                      ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Approved
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Rejected")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    form.status === "Rejected"
                      ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-red-50"
                  }`}
                >
                  Rejected
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Confirmed")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    form.status === "Confirmed"
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  Confirmed
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                to="/quotations"
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={updateLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all text-sm font-medium"
              >
                {updateLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isEdit ? "Update Quotation" : "Save Quotation"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default QuotationForm;
