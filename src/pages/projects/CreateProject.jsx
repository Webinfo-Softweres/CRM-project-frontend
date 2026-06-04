import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ArrowLeft,
  Save,
  FolderKanban,
  User,
  Calendar,
  Clock3,
  FileText,
} from "lucide-react";

import { fetchCustomers } from "../../redux/customerSlice";
import { fetchQuotations } from "../../redux/quotationSlice";
import { createProject } from "../../redux/projectSlice";
import { PROJECT_STATUS } from "../../constants/projectStatus";

function CreateProject() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: customers, loading: customersLoading, lastFetched: customersLastFetched } = useSelector(
    (state) => state.customers,
  );
  const { items: quotations, loading: quotationsLoading, lastFetched: quotationsLastFetched } = useSelector(
    (state) => state.quotations,
  );
  const { createLoading } = useSelector((state) => state.projects);

  const [form, setForm] = useState({
    customer_id: "",
    quotation_id: "",
    project_name: "",
    start_date: "",
    end_date: "",
    status: "Ongoing",
  });

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isCustomersStale = !customersLastFetched || (Date.now() - customersLastFetched > CACHE_DURATION);
    const isQuotationsStale = !quotationsLastFetched || (Date.now() - quotationsLastFetched > CACHE_DURATION);

    if (customers.length === 0 || isCustomersStale) {
      dispatch(fetchCustomers());
    }
    if (quotations.length === 0 || isQuotationsStale) {
      dispatch(fetchQuotations());
    }
  }, [dispatch, customers.length, quotations.length, customersLastFetched, quotationsLastFetched]);

  const approvedQuotations = quotations.filter(
    (q) => q.status === "Approved" || q.status === "Confirmed",
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_id || !form.quotation_id || !form.project_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      customer_id: Number(form.customer_id),
      quotation_id: Number(form.quotation_id),
      project_name: form.project_name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    };

    try {
      await dispatch(createProject(payload)).unwrap();
      toast.success("Project created successfully");
      navigate("/projects");
    } catch (err) {
      toast.error(err || "Failed to create project");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Create New Project
              </h1>

              <p className="text-gray-500 mt-1">
                Add a project linked to a customer and approved quotation
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Project Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <User size={18} className="text-gray-400" />

                    <select
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      className="w-full ml-3 outline-none bg-transparent"
                      required
                    >
                      <option value="" disabled>
                        {customersLoading ? "Loading customers..." : "Select customer"}
                      </option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quotation */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Approved Quotation *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <FileText size={18} className="text-gray-400" />

                    <select
                      name="quotation_id"
                      value={form.quotation_id}
                      onChange={handleChange}
                      className="w-full ml-3 outline-none bg-transparent"
                      required
                    >
                      <option value="" disabled>
                        {quotationsLoading ? "Loading quotations..." : "Select approved quote"}
                      </option>

                      {approvedQuotations.map((quote) => (
                        <option key={quote.id} value={quote.id}>
                          #{quote.id} — {quote.description} (₹{quote.amount})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Name */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Project Name *
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <FolderKanban size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      placeholder="Enter project title"
                      className="w-full ml-3 outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <Calendar size={18} className="text-gray-400" />

                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    End Date (Deadline)
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <Clock3 size={18} className="text-gray-400" />

                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className="w-full ml-3 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <div className="mt-3 flex items-center flex-wrap gap-3">
                    {[
                      { value: "Ongoing",   active: "bg-blue-100 text-blue-700 ring-2 ring-blue-300"   },
                      { value: "Completed", active: "bg-green-100 text-green-700 ring-2 ring-green-300" },
                      { value: "Hold",      active: "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300" },
                    ].map(({ value, active }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, status: value }))}
                        className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                          form.status === value
                            ? active
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link
                to="/projects"
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <Save size={18} />
                {createLoading ? "Saving..." : "Save Project"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default CreateProject;
