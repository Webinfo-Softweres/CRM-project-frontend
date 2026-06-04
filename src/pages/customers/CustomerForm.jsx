import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createCustomer,
  updateCustomerData,
  fetchCustomers,
  clearCustomerError,
} from "../../redux/customerSlice";

function CustomerForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    items: customers,
    createLoading,
    createError,
    updateLoading,
    updateError,
    lastFetched: customersLastFetched,
  } = useSelector((state) => state.customers);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    address: "",
  });

  const existingCustomer = isEdit
    ? customers.find((c) => String(c.id) === String(id))
    : null;
  const isLoading = createLoading || updateLoading;
  const error = createError || updateError;

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isCustomersStale = !customersLastFetched || (Date.now() - customersLastFetched > CACHE_DURATION);
    if (isEdit && (customers.length === 0 || isCustomersStale)) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, isEdit, customers.length, customersLastFetched]);

  // Load customer data when editing
  useEffect(() => {
    if (isEdit && existingCustomer) {
      setForm({
        name: existingCustomer.name || "",
        email: existingCustomer.email || "",
        phone: existingCustomer.phone || "",
        company_name: existingCustomer.company_name || "",
        address: existingCustomer.address || "",
      });
    }
  }, [isEdit, existingCustomer]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (error) dispatch(clearCustomerError());

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company_name: form.company_name,
      address: form.address,
    };

    try {
      if (isEdit) {
        await dispatch(
          updateCustomerData({ id: String(id), customerData: payload }),
        ).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        toast.success("Customer added successfully");
      }
      navigate("/customers");
    } catch {
      toast.error("Failed to save customer");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/customers"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Customer" : "Add New Customer"}
              </h1>

              <p className="text-gray-500 mt-1 text-sm md:text-base">
                {isEdit
                  ? "Update customer details"
                  : "Create and manage customer details"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-5 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer Name
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <User size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter customer name"
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Company Name
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <Building2 size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <Mail size={18} className="text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <Phone size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <MapPin size={18} className="text-gray-400 mt-1" />

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter customer address"
                      className="w-full ml-3 outline-none bg-transparent resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {createError || updateError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                {createError || updateError}
              </div>
            ) : null}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t">
              <Link
                to="/customers"
                className="w-full sm:w-fit px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all text-center"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-fit bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Save size={18} />
                {isLoading
                  ? "Saving..."
                  : isEdit
                    ? "Update Customer"
                    : "Save Customer"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default CustomerForm;
