import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  Clock3,
  FileText,
  FolderKanban,
  Pencil,
  User2,
  AlertTriangle,
} from "lucide-react";

import { fetchTaskById, clearCurrentTask } from "../../redux/taskSlice";
import { fetchProjects } from "../../redux/projectSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { fetchUsers } from "../../redux/userSlice";
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
      <dd className="text-sm font-semibold text-slate-800 flex-1">
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

// ── TaskDetails Page ──────────────────────────────────────────────────────────
function TaskDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const { currentTask: task, currentTaskLoading, currentTaskError } =
    useSelector((state) => state.tasks);
  const { items: projects, lastFetched: projectsLastFetched } = useSelector((state) => state.projects);
  const { items: departments, lastFetched: departmentsLastFetched } = useSelector((state) => state.departments);
  const { items: users, lastFetched: usersLastFetched } = useSelector((state) => state.users);

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const isProjectsStale = !projectsLastFetched || (Date.now() - projectsLastFetched > CACHE_DURATION);
    const isDepartmentsStale = !departmentsLastFetched || (Date.now() - departmentsLastFetched > CACHE_DURATION);
    const isUsersStale = !usersLastFetched || (Date.now() - usersLastFetched > CACHE_DURATION);

    dispatch(fetchTaskById(id));

    if (projects.length === 0 || isProjectsStale) {
      dispatch(fetchProjects());
    }
    if (departments.length === 0 || isDepartmentsStale) {
      dispatch(fetchDepartments());
    }
    if (users.length === 0 || isUsersStale) {
      dispatch(fetchUsers());
    }

    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, id, projects.length, departments.length, users.length, projectsLastFetched, departmentsLastFetched, usersLastFetched]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (currentTaskLoading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading task details...</p>
        </div>
      </AdminLayout>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (currentTaskError || (!currentTaskLoading && !task)) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Task not found</h2>
          <p className="text-gray-500 mt-2">
            {currentTaskError || "The task you are looking for does not exist."}
          </p>
          <Link
            to="/tasks"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
          >
            Back to Tasks
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // ── Resolved relationships ─────────────────────────────────────────────────
  const projectName =
    projects.find((p) => String(p.id) === String(task.project_id))?.project_name ||
    "Not assigned";

  const departmentName =
    departments.find((d) => String(d.id) === String(task.department_id))?.name ||
    "Not assigned";

  const assignedToId = typeof task.assigned_to === "object" && task.assigned_to !== null
    ? task.assigned_to.id
    : task.assigned_to;

  const assignedUser = users.find((u) => String(u.id) === String(assignedToId));
  
  const assignedTo = assignedUser
    ? (assignedUser.name || assignedUser.email)
    : (typeof task.assigned_to === "object" && task.assigned_to !== null
        ? (task.assigned_to.name || task.assigned_to.email || "Not assigned")
        : "Not assigned");

  const timeline = [
    {
      date: "Created",
      title: "Task created",
      description: formatDate(task.created_at) + " at " + formatTime(task.created_at),
      color: "bg-blue-600",
    },
    {
      date: "Assigned",
      title: "Staff assigned",
      description: assignedTo !== "Not assigned"
        ? `Assigned to ${assignedTo}`
        : "No staff assigned yet",
      color: "bg-purple-500",
    },
    {
      date: "Status",
      title: "Current status",
      description: task.status || "Pending",
      color:
        task.status === "Completed"
          ? "bg-green-500"
          : task.status === "In Progress"
          ? "bg-orange-500"
          : task.status === "Rejected"
          ? "bg-red-500"
          : "bg-yellow-500",
    },
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
                to="/tasks"
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl shrink-0 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Task #{task.id}</span>
                  <StatusBadge status={task.status} />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                  {task.title}
                </h1>

                <p className="text-gray-500 mt-1 text-sm">{projectName}</p>
              </div>
            </div>

            {can("tasks:update") && (
              <Link
                to={`/tasks/edit/${task.id}`}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
              >
                <Pencil size={16} />
                Edit Task
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — detail groups */}
          <div className="xl:col-span-2 space-y-5">
            <DetailGroup
              title="Task"
              icon={FileText}
              iconClass="bg-blue-100 text-blue-600"
            >
              <InfoRow label="Title" value={task.title} />
              <InfoRow label="Description" value={task.description || "-"} />
              <InfoRow
                label="Estimated Hours"
                value={
                  task.estimated_hours != null
                    ? `${task.estimated_hours} hrs`
                    : "-"
                }
              />
              <InfoRow label="Created" value={formatDate(task.created_at)} />
            </DetailGroup>

            <DetailGroup
              title="Project"
              icon={FolderKanban}
              iconClass="bg-cyan-100 text-cyan-600"
            >
              <InfoRow label="Project Name" value={projectName} />
            </DetailGroup>

            <DetailGroup
              title="Assignment"
              icon={User2}
              iconClass="bg-purple-100 text-purple-600"
            >
              <InfoRow label="Department" value={departmentName} />
              <InfoRow label="Assigned To" value={assignedTo} />
            </DetailGroup>

            <DetailGroup
              title="Status & Priority"
              icon={Building2}
              iconClass="bg-green-100 text-green-600"
            >
              <InfoRow
                label="Status"
                value={<StatusBadge status={task.status} />}
              />
              <InfoRow
                label="Priority"
                value={<PriorityBadge priority={task.priority} />}
              />
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
                    Ordered by task activity
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

              <div className="grid grid-cols-1 gap-3 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
                  <Clock3 size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Planned Hours</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {task.estimated_hours != null
                        ? `${task.estimated_hours} hrs`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <CalendarDays size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created Date</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(task.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default TaskDetails;
