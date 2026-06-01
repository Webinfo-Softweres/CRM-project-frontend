// PermissionForm.jsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";

import {
  ArrowLeft,
  Save,
  Shield,
  FileText,
} from "lucide-react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import { createPermission, updatePermissionData, fetchPermissions } from "../../redux/permissionSlice";
import toast from "react-hot-toast";

function PermissionForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const { items: permissions, createLoading, updateLoading, loading: fetchLoading } = useSelector((state) => state.permissions);
  const loading = createLoading || updateLoading || (isEdit && fetchLoading);

  const existingPermission = isEdit ? permissions.find((p) => String(p.id) === String(id)) : null;

  const initialFormData = useMemo(() => {
    if (isEdit && existingPermission) {
      return {
        module: existingPermission.module || "",
        action: existingPermission.action || "",
        description: existingPermission.description || "",
      };
    }
    return {
      module: "",
      action: "",
      description: "",
    };
  }, [isEdit, existingPermission]);

  const [formData, setFormData] = useState(initialFormData);

  // Use a key to force form remount when permission data loads
  const formKey = useMemo(() => {
    return isEdit && existingPermission ? existingPermission.id : 'new';
  }, [isEdit, existingPermission]);

  useEffect(() => {
    if (isEdit && permissions.length === 0) {
      dispatch(fetchPermissions());
    }
  }, [dispatch, isEdit, permissions.length]);

  // Show loading state when editing and fetching data
  if (isEdit && fetchLoading && !existingPermission) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading permission...</div>
        </div>
      </AdminLayout>
    );
  }

  // Show not found when editing and permission doesn't exist after fetch
  if (isEdit && !fetchLoading && !existingPermission && permissions.length > 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Permission not found</div>
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.module || !formData.action) {
      toast.error("Module and Action are required");
      return;
    }

    try {
      if (isEdit) {
        await dispatch(updatePermissionData({ id, permissionData: formData })).unwrap();
        toast.success("Permission updated successfully");
      } else {
        await dispatch(createPermission(formData)).unwrap();
        toast.success("Permission created successfully");
      }
      
      navigate("/settings/permissions");
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} permission`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/settings/permissions"
              className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {isEdit ? "Edit Permission" : "Add New Permission"}
              </h1>

              <p className="text-gray-500 mt-1">
                {isEdit ? "Update permission details" : "Create a new system permission"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={formKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Permission Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Permission Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Module */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Module <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Shield size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="module"
                      value={formData.module}
                      onChange={handleChange}
                      placeholder="e.g., Users, Customers, Projects"
                      className="w-full ml-3 outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Action */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Action <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Shield size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="action"
                      value={formData.action}
                      onChange={handleChange}
                      placeholder="e.g., Create, Read, Update, Delete"
                      className="w-full ml-3 outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <FileText size={18} className="text-gray-400 mt-1" />

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what this permission allows"
                      rows={3}
                      className="w-full ml-3 outline-none bg-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link
                to="/settings/permissions"
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all font-medium"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? "Saving..." : (isEdit ? "Update Permission" : "Create Permission")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default PermissionForm;
