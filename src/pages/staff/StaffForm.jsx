import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createUser,
  updateUserData,
  fetchUsers,
  clearUserError,
} from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { fetchRoles } from "../../redux/roleSlice";

function StaffForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    items: users,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.users);
  const {
    items: roles,
    loading: rolesLoading,
    error: rolesError,
  } = useSelector((state) => state.roles);
  const {
    items: departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useSelector((state) => state.departments);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
    department_id: "",
    status: "Active",
  });

  const [showPassword, setShowPassword] = useState(false);

  const existingUser = isEdit
    ? users.find((u) => String(u.id) === String(id))
    : null;
  const isLoading = createLoading || updateLoading;
  const error = createError || updateError;

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchDepartments());
    if (isEdit && users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isEdit, users.length]);

  // Load user data when editing
  useEffect(() => {
    const updateForm = () => {
      if (isEdit && existingUser) {
        setForm({
          name: existingUser.name || "",
          email: existingUser.email || "",
          phone: existingUser.phone || "",
          password: "",
          role_id: existingUser.role_id || "",
          department_id: existingUser.department_id || "",
          status: existingUser.status || "Active",
        });
      }
    };

    updateForm();
  }, [isEdit, existingUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (error) dispatch(clearUserError());

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleStatusChange = (status) => {
    setForm((currentForm) => ({ ...currentForm, status }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role_id: Number(form.role_id),
      department_id: Number(form.department_id),
      status: form.status,
    };

    // Only include password if it's provided (for both add and edit)
    if (form.password) {
      payload.password = form.password;
    }

    try {
      if (isEdit) {
        await dispatch(
          updateUserData({ id: String(id), userData: payload }),
        ).unwrap();
        toast.success("Staff updated successfully");
      } else {
        if (!form.password) {
          toast.error("Password is required");
          return;
        }

        await dispatch(createUser(payload)).unwrap();
        toast.success("Staff added successfully");
      }
      navigate("/staff");
    } catch {
      toast.error("Failed to save staff");
      // The slice stores the backend error for display below.
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/staff"
                className="bg-white shadow-sm border p-3 rounded-2xl hover:bg-gray-100 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {isEdit ? "Edit Staff" : "Add New Staff"}
                </h1>

                <p className="text-gray-500 mt-1">
                  {isEdit
                    ? "Update employee information"
                    : "Create and manage employee accounts"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <User size={18} className="text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
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

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password{" "}
                    {isEdit && (
                      <span className="text-gray-500">
                        (Leave empty to keep current)
                      </span>
                    )}
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500 relative">
                    <Lock size={18} className="text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        isEdit
                          ? "Enter new password (optional)"
                          : "Enter password"
                      }
                      required={!isEdit}
                      className="w-full ml-3 pr-8 outline-none bg-transparent"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Job Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Briefcase size={18} className="text-gray-400" />

                    <select
                      name="role_id"
                      value={form.role_id}
                      onChange={handleChange}
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    >
                      <option value="">
                        {rolesLoading ? "Loading roles..." : "Select role"}
                      </option>

                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2">
                    <Building2 size={18} className="text-gray-400" />

                    <select
                      name="department_id"
                      value={form.department_id}
                      onChange={handleChange}
                      required
                      className="w-full ml-3 outline-none bg-transparent"
                    >
                      <option value="">
                        {departmentsLoading
                          ? "Loading departments..."
                          : "Select department"}
                      </option>

                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("Active")}
                      className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                        form.status === "Active"
                          ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-green-50"
                      }`}
                    >
                      Active
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange("Inactive")}
                      className={`px-5 py-2 rounded-2xl font-medium transition-all ${
                        form.status === "Inactive"
                          ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                          : "bg-gray-100 text-gray-700 hover:bg-red-50"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {rolesError || departmentsError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                {rolesError || departmentsError}
              </div>
            ) : null}

            {/* Permissions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Permissions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Dashboard",
                  "Staff",
                  "Customers",
                  "Projects",
                  "Tasks",
                  "Reports",
                  "Feedback",
                  "Settings",
                ].map((permission, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 border rounded-2xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <input type="checkbox" />

                    <span className="text-sm font-medium">{permission}</span>
                  </label>
                ))}
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
                to="/staff"
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
                    ? "Update Staff"
                    : "Save Staff"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default StaffForm;
