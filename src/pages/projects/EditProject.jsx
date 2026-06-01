import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { fetchProjects, updateProjectData } from "../../redux/projectSlice";
import { PROJECT_STATUS } from "../../constants/projectStatus";

function EditProject() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: projects, loading: projectsLoading, updateLoading } = useSelector(
    (state) => state.projects,
  );
  const { items: customers, loading: customersLoading } = useSelector(
    (state) => state.customers,
  );
  const { items: quotations, loading: quotationsLoading } = useSelector(
    (state) => state.quotations,
  );

  const project = projects.find((p) => String(p.id) === String(id));

  const [form, setForm] = useState({
    customer_id: "",
    quotation_id: "",
    project_name: "",
    start_date: "",
    end_date: "",
    status: "Ongoing",
  });

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchQuotations());
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Load project details into form once retrieved
  useEffect(() => {
    if (project) {
      setForm({
        customer_id: project.customer_id ? String(project.customer_id) : "",
        quotation_id: project.quotation_id ? String(project.quotation_id) : "",
        project_name: project.project_name || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        status: project.status || "Ongoing",
      });
    }
  }, [project]);

  const approvedQuotations = quotations.filter(
    (q) => q.status === "Approved" || q.status === "Confirmed",
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project_name) {
      toast.error("Project name is required");
      return;
    }

    const payload = {
      project_name: form.project_name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    };

    try {
      await dispatch(
        updateProjectData({ id: Number(id), projectData: payload }),
      ).unwrap();
      toast.success("Project updated successfully");
      navigate("/projects");
    } catch (err) {
      toast.error(err || "Failed to update project");
    }
  };

  if (projectsLoading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Loading project details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Project not found</h1>
          <Link
            to="/projects"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl"
          >
            Back to Projects
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">Edit Project</h1>
            <p className="text-gray-500 mt-1">
              Update project #{project.id} — {project.project_name}
            </p>
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
                {/* Customer (Read-only on edit) */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer (Cannot be changed)
                  </label>

                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                    <User size={18} className="text-gray-400" />
                    <select
                      name="customer_id"
                      value={form.customer_id}
                      disabled
                      className="w-full ml-3 outline-none bg-transparent cursor-not-allowed text-gray-500"
                    >
                      <option value="" disabled>
                        Select customer
                      </option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Approved Quotation (Read-only on edit) */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Approved Quotation (Cannot be changed)
                  </label>

                  <div className="flex items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                    <FileText size={18} className="text-gray-400" />
                    <select
                      name="quotation_id"
                      value={form.quotation_id}
                      disabled
                      className="w-full ml-3 outline-none bg-transparent cursor-not-allowed text-gray-500"
                    >
                      <option value="" disabled>
                        Select approved quote
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
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <div className="flex items-center gap-4 flex-wrap mt-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: "Ongoing" }))}
                      className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                        form.status === "Ongoing"
                          ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      Ongoing
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: "Completed" }))}
                      className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                        form.status === "Completed"
                          ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-green-50"
                      }`}
                    >
                      Completed
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: "Hold" }))}
                      className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                        form.status === "Hold"
                          ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                          : "bg-gray-100 text-gray-700 hover:bg-orange-50"
                      }`}
                    >
                      Hold
                    </button>
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
                disabled={updateLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <Save size={18} />
                {updateLoading ? "Saving..." : "Update Project"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default EditProject;
