// src/pages/workReports/WorkReportForm.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import {
  ArrowLeft,
  Save,
  User,
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

import { motion } from "framer-motion";
import { createWorkReport, updateWorkReportData, fetchWorkReports } from "../../redux/workReportSlice";
import { fetchUsers } from "../../redux/userSlice";

function WorkReportForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { items: reports, createLoading, updateLoading } = useSelector((state) => state.workReports);
  const users = useSelector((state) => state.users.items);
  const usersLoading = useSelector((state) => state.users.loading);
  const isLoading = createLoading || updateLoading;

  const existingReport = isEdit
    ? reports.find((r) => String(r.id) === String(id))
    : null;

  // Get logged in user's ID
  const authUser = useSelector((state) => state.auth.user);
  const loggedInUserId = authUser?.id || (Cookies.get("user_id") ? Number(Cookies.get("user_id")) : "");
  const loggedInUserName = authUser?.name || "";

  const [form, setForm] = useState({
    user_id: loggedInUserId || "",
    report_date: new Date().toISOString().split("T")[0],
    total_hours: "",
    summary: "",
  });

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
    if (isEdit && reports.length === 0) {
      dispatch(fetchWorkReports());
    }
  }, [dispatch, users.length, isEdit, reports.length]);

  // Update default user_id once loggedInUserId becomes available
  useEffect(() => {
    const deferUpdate = async () => {
      await Promise.resolve();
      if (!isEdit && loggedInUserId && !form.user_id) {
        setForm((prev) => ({ ...prev, user_id: loggedInUserId }));
      }
    };
    deferUpdate();
  }, [loggedInUserId, form.user_id, isEdit]);

  // Load report data when editing
  useEffect(() => {
    const updateForm = async () => {
      await Promise.resolve();
      if (isEdit && existingReport) {
        setForm({
          user_id: existingReport.user_id || "",
          report_date: existingReport.report_date || "",
          total_hours: existingReport.total_hours || "",
          summary: existingReport.summary || "",
        });
      }
    };
    updateForm();
  }, [isEdit, existingReport]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.total_hours || isNaN(Number(form.total_hours)) || Number(form.total_hours) <= 0) {
      toast.error("Please enter a valid number of hours");
      return;
    }
    if (!form.summary || form.summary.trim() === "") {
      toast.error("Please enter a work summary");
      return;
    }

    try {
      if (isEdit) {
        const payload = {
          total_hours: Number(form.total_hours),
          summary: form.summary,
        };
        await dispatch(updateWorkReportData({ id: String(id), reportData: payload })).unwrap();
        toast.success("Work report updated successfully");
      } else {
        if (!form.user_id) {
          toast.error("Please select a staff member");
          return;
        }
        if (!form.report_date) {
          toast.error("Please select a report date");
          return;
        }
        const payload = {
          user_id: Number(form.user_id),
          report_date: form.report_date,
          total_hours: Number(form.total_hours),
          summary: form.summary,
        };
        await dispatch(createWorkReport(payload)).unwrap();
        toast.success("Work report created successfully");
      }
      navigate("/work-reports");
    } catch (err) {
      toast.error(err || "Failed to save work report");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/work-reports"
            className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isEdit ? "Edit Work Report" : "Create Work Report"}
            </h1>

            <p className="text-gray-500 mt-1">
              {isEdit ? "Modify employee daily work summary" : "Submit employee daily work summary"}
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Staff */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Staff Name *
              </label>

              <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 bg-gray-50 border-gray-200 opacity-75">
                <User size={18} className="text-gray-400" />

                <input
                  type="text"
                  value={users.find(u => String(u.id) === String(form.user_id))?.name || loggedInUserName || ""}
                  className="w-full ml-3 outline-none bg-transparent"
                  readOnly
                  placeholder={usersLoading ? "Loading..." : ""}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Report Date *
              </label>

              <div className={`flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 ${isEdit ? "bg-gray-50 border-gray-200 opacity-75" : "focus-within:ring-2 focus-within:ring-blue-500"}`}>
                <CalendarDays size={18} className="text-gray-400" />

                <input
                  type="date"
                  name="report_date"
                  value={form.report_date}
                  onChange={handleChange}
                  className="w-full ml-3 outline-none bg-transparent"
                  required
                  disabled={isEdit}
                />
              </div>
            </div>

            {/* Hours */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Hours *
              </label>

              <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                <Clock3 size={18} className="text-gray-400" />

                <input
                  type="number"
                  name="total_hours"
                  value={form.total_hours}
                  onChange={handleChange}
                  placeholder="Enter total hours"
                  className="w-full ml-3 outline-none bg-transparent"
                  required
                  min="0"
                  step="any"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Work Summary *
              </label>

              <div className="flex items-start border border-gray-300 rounded-2xl px-4 py-3 mt-2 focus-within:ring-2 focus-within:ring-blue-500">
                <FileText size={18} className="text-gray-400 mt-1" />

                <textarea
                  rows="6"
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="Enter work summary..."
                  className="w-full ml-3 outline-none bg-transparent resize-none"
                  required
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link
                to="/work-reports"
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <Save size={18} />
                {isLoading ? "Saving..." : "Save Report"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default WorkReportForm;
