import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Clock3,
  FileText,
  User2,
  AlertTriangle,
  Pencil,
} from "lucide-react";

import { fetchWorkReports } from "../../redux/workReportSlice";
import { fetchUsers } from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { usePermissions } from "../../hooks/usePermissions";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500 sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 flex-1 whitespace-pre-wrap">
        {value ?? "-"}
      </dd>
    </div>
  );
}

function DetailGroup({ title, icon: Icon, iconClass, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconClass}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <dl className="px-6 py-2">{children}</dl>
    </div>
  );
}

// ── WorkReportDetails Page ────────────────────────────────────────────────────
function WorkReportDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const { items: reports, loading: currentReportLoading, error: currentReportError, lastFetched: reportsLastFetched } =
    useSelector((state) => state.workReports);
  const { items: users, loading: usersLoading, lastFetched: usersLastFetched } = useSelector((state) => state.users);
  const { items: departments, loading: departmentsLoading, lastFetched: departmentsLastFetched } = useSelector((state) => state.departments);

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isReportsStale = !reportsLastFetched || (Date.now() - reportsLastFetched > CACHE_DURATION);
    const isUsersStale = !usersLastFetched || (Date.now() - usersLastFetched > CACHE_DURATION);
    const isDepartmentsStale = !departmentsLastFetched || (Date.now() - departmentsLastFetched > CACHE_DURATION);

    if (isReportsStale) {
      dispatch(fetchWorkReports());
    }
    if (isUsersStale) {
      dispatch(fetchUsers());
    }
    if (isDepartmentsStale) {
      dispatch(fetchDepartments());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const report = reports.find((r) => String(r.id) === String(id));
  const isLoading = currentReportLoading || usersLoading || departmentsLoading;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading && !report) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading report details...</p>
        </div>
      </AdminLayout>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (currentReportError || (!isLoading && !report)) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Report not found</h2>
          <p className="text-gray-500 mt-2">
            {currentReportError || "The work report you are looking for does not exist."}
          </p>
          <Link
            to="/work-reports"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
          >
            Back to Work Reports
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // ── Resolved relationships ─────────────────────────────────────────────────
  const assignedUser = users.find((u) => String(u.id) === String(report.user_id));
  
  const staffName = assignedUser
    ? (assignedUser.name || assignedUser.email)
    : "Loading or not found";

  const departmentName = assignedUser?.department_id 
    ? departments.find(d => String(d.id) === String(assignedUser.department_id))?.name || "Not assigned"
    : "-";

  const timeline = [
    {
      date: "Created",
      title: "Report created",
      description: formatDate(report.created_at) + " at " + formatTime(report.created_at),
      color: "bg-blue-600",
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                to="/work-reports"
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl shrink-0 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Report #{report.id}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                  Daily Work Report
                </h1>

                <p className="text-gray-500 mt-1 text-sm">Submitted by {staffName}</p>
              </div>
            </div>

            {can("reports:update") && (
              <Link
                to={`/work-reports/edit/${report.id}`}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
              >
                <Pencil size={16} />
                Edit Report
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — detail groups */}
          <div className="xl:col-span-2 space-y-5">
            <DetailGroup
              title="Report Details"
              icon={FileText}
              iconClass="bg-blue-100 text-blue-600"
            >
              <InfoRow label="Summary" value={report.summary} />
              <InfoRow
                label="Total Hours"
                value={`${report.total_hours} hrs`}
              />
              <InfoRow label="Report Date" value={formatDate(report.report_date)} />
            </DetailGroup>

            <DetailGroup
              title="Staff Information"
              icon={User2}
              iconClass="bg-purple-100 text-purple-600"
            >
              <InfoRow label="Email" value={assignedUser?.email || "-"} />
              <InfoRow label="Department" value={departmentName} />
            </DetailGroup>
          </div>

          {/* Right — timeline sidebar */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Timeline</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Activity history
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                <ul className="space-y-6">
                  {timeline.map((event, index) => (
                    <li
                      key={`${event.title}-${index}`}
                      className="relative pl-8"
                    >
                      <span
                        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${event.color}`}
                      />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {event.date}
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                        {event.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default WorkReportDetails;
