import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";

import {
  Users,
  FolderKanban,
  ClipboardList,
  FileText,
  IndianRupee,
  TrendingUp,
  UserCheck,
  UserX,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { usePermissions } from "../../hooks/usePermissions";

import { fetchDashboardCountsApi } from "../../services/apiCalls";

// ── Shared tooltip style ──────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "12px",
  },
};

// ── Chart card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, icon: Icon, iconColor, children, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-5 h-full ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className={`text-base font-bold text-slate-800 ${onClick ? "group-hover:text-blue-600 transition-colors" : ""}`}>
              {title}
            </h3>
            {onClick && (
              <ArrowUpRight
                size={15}
                className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
              />
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && <Icon size={20} className={iconColor ?? "text-gray-400"} />}
      </div>
      {children}
    </motion.div>
  );
}

// ── Custom pie label ──────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [leadsView, setLeadsView] = useState("day");
  const [dashboardData, setDashboardData] = useState(null);

  // Selectors (kept for parts that may still rely on store state, if any, but they will be empty if not fetched)
  const projects = useSelector((state) => state.projects.items) || [];
  const tasks = useSelector((state) => state.tasks.items) || [];
  const customers = useSelector((state) => state.customers.items) || [];
  const enquiries = useSelector((state) => state.enquiries.items) || [];
  const quotations = useSelector((state) => state.quotations.items) || [];
  const users = useSelector((state) => state.users.items) || [];
  const feedback = useSelector((state) => state.feedback.items) || [];
  const activity = useSelector((state) => state.activity.items) || [];

  useEffect(() => {
    const loadDashboardCounts = async () => {
      try {
        const data = await fetchDashboardCountsApi();
        if (data && data.status === "success") {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      }
    };
    loadDashboardCounts();
  }, [dispatch]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalProjects   = dashboardData ? dashboardData.counts.total_projects : 0;
  const ongoingProjects = dashboardData ? dashboardData.project_status_counts.ongoing : 0;
  const completedProjects = dashboardData ? dashboardData.project_status_counts.completed : 0;
  const holdProjects    = dashboardData ? dashboardData.project_status_counts.hold : 0;

  const totalTasks      = dashboardData ? dashboardData.counts.total_tasks : 0;
  const completedTasks  = dashboardData ? dashboardData.task_status_counts.completed : 0;
  const pendingTasks    = dashboardData ? dashboardData.task_status_counts.pending : 0;
  const inProgressTasks = dashboardData ? dashboardData.task_status_counts.in_progress : 0;

  const totalCustomers  = dashboardData ? dashboardData.counts.total_customers : 0;
  const activeCustomers = dashboardData ? dashboardData.counts.total_customers : 0; // Using total as API doesn't split

  const totalEnquiries  = dashboardData ? (dashboardData.enquiry_status_counts.new + dashboardData.enquiry_status_counts.follow_up + dashboardData.enquiry_status_counts.closed) : 0;
  const newEnquiries    = dashboardData ? dashboardData.enquiry_status_counts.new : 0;

  // Since we aren't fetching quotations, this will be 0.
  const approvedQuotations = 0;
  const totalRevenue = 0;

  const totalStaff   = dashboardData ? dashboardData.counts.total_staff : 0;
  const presentStaff = dashboardData ? dashboardData.counts.present_staff : 0;
  const absentStaff  = dashboardData ? dashboardData.counts.absent_staff : 0;

  // ── Chart data ──────────────────────────────────────────────────────────────

  // Task status — pie
  const taskPieData = dashboardData ? [
    { name: "Completed",   value: dashboardData.task_status_counts.completed,  color: "#22c55e" },
    { name: "In Progress", value: dashboardData.task_status_counts.in_progress, color: "#3b82f6" },
    { name: "Pending",     value: dashboardData.task_status_counts.pending,    color: "#f59e0b" },
    { name: "Rejected",    value: dashboardData.task_status_counts.rejected,   color: "#ef4444" },
  ].filter((d) => d.value > 0) : [];

  // Project status — pie
  const projectPieData = dashboardData ? [
    { name: "Ongoing",   value: dashboardData.project_status_counts.ongoing,   color: "#6366f1" },
    { name: "Completed", value: dashboardData.project_status_counts.completed, color: "#22c55e" },
    { name: "Hold",      value: dashboardData.project_status_counts.hold,      color: "#f59e0b" },
  ].filter((d) => d.value > 0) : [];

  // Enquiry status — bar
  const enquiryStatusData = dashboardData ? [
    { status: "New", count: dashboardData.enquiry_status_counts.new },
    { status: "Follow Up", count: dashboardData.enquiry_status_counts.follow_up },
    { status: "Closed", count: dashboardData.enquiry_status_counts.closed },
  ] : [];

  // Activity status — bar
  const activityStatusData = dashboardData ? [
    { status: "Create", count: dashboardData.activity_log_counts.create },
    { status: "Read", count: dashboardData.activity_log_counts.read },
    { status: "Update", count: dashboardData.activity_log_counts.update },
    { status: "Delete", count: dashboardData.activity_log_counts.delete },
  ].filter((d) => d.count > 0) : [];

  // Feedback rating — Bad (1-2), Good (3-4), Excellent (5)
  const feedbackRatingData = dashboardData ? [
    { label: "Bad",       count: dashboardData.feedback_rating_counts.bad, color: "#ef4444" },
    { label: "Good",      count: dashboardData.feedback_rating_counts.good, color: "#f59e0b" },
    { label: "Excellent", count: dashboardData.feedback_rating_counts.excellent, color: "#22c55e" },
  ] : [];

  // Staff attendance — radial
  const staffAttendanceData = [
    { name: "Present", value: presentStaff, fill: "#22c55e" },
    { name: "Absent",  value: absentStaff,  fill: "#ef4444" },
  ];

  // Staff performance
  const staffPerformanceData = dashboardData ? dashboardData.staff_performance.map(u => ({
    name: u.staff_name,
    completed: u.completed_tasks,
    pending: u.pending_tasks
  })) : [];

  // Leads
  const getLeadsData = () => {
    if (leadsView === "day") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      enquiries.forEach((e) => {
        if (e.created_at) {
          const d = new Date(e.created_at).getDay();
          counts[d]++;
        }
      });
      return [
        { label: "Mon", leads: counts[1] },
        { label: "Tue", leads: counts[2] },
        { label: "Wed", leads: counts[3] },
        { label: "Thu", leads: counts[4] },
        { label: "Fri", leads: counts[5] },
        { label: "Sat", leads: counts[6] },
        { label: "Sun", leads: counts[0] },
      ];
    }
    if (leadsView === "week") {
      const counts = [0, 0, 0, 0];
      enquiries.forEach((e) => {
        if (e.created_at) {
          const date = new Date(e.created_at).getDate();
          const w = Math.min(3, Math.floor((date - 1) / 7));
          counts[w]++;
        }
      });
      return [
        { label: "Week 1", leads: counts[0] },
        { label: "Week 2", leads: counts[1] },
        { label: "Week 3", leads: counts[2] },
        { label: "Week 4", leads: counts[3] },
      ];
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);
    enquiries.forEach((e) => {
      if (e.created_at) {
        const m = new Date(e.created_at).getMonth();
        counts[m]++;
      }
    });
    return months.slice(0, 6).map((m, idx) => ({
      label: m,
      leads: counts[idx]
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your business overview</p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Projects",   value: totalProjects,   sub: `${ongoingProjects} ongoing`,          icon: FolderKanban, bg: "bg-blue-100",   ic: "text-blue-600",   path: "/projects"   },
            { label: "Tasks",      value: totalTasks,      sub: `${completedTasks} completed`,         icon: ClipboardList, bg: "bg-orange-100", ic: "text-orange-600", path: "/tasks"      },
            { label: "Customers",  value: totalCustomers,  sub: `${activeCustomers} active`,           icon: Users,        bg: "bg-green-100",  ic: "text-green-600",  path: "/customers"  },
            { label: "Revenue",    value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: `${approvedQuotations} approved quotes`, icon: IndianRupee, bg: "bg-indigo-100", ic: "text-indigo-600", path: "/quotations" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800 group-hover:text-blue-600 transition-colors">{item.value}</h2>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {item.sub}
                    <ArrowUpRight size={12} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </p>
                </div>
                <div className={`${item.bg} p-3 md:p-4 rounded-2xl`}>
                  <item.icon className={item.ic} size={22} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 1 — Task status pie + Project status pie */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 md:gap-5">
          <div className="w-full lg:w-1/2">
            <ChartCard title="Task Status" subtitle="Distribution by status" icon={ClipboardList} iconColor="text-orange-500" delay={0.1} onClick={() => navigate("/tasks")}>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={taskPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={PieLabel}
                      onClick={() => navigate("/tasks")} style={{ cursor: "pointer" }}>
                      {taskPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {taskPieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-sm text-gray-600">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-sm font-bold text-slate-800">{totalTasks}</span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="w-full lg:w-1/2">
            <ChartCard title="Project Status" subtitle="Distribution by status" icon={FolderKanban} iconColor="text-blue-500" delay={0.15} onClick={() => navigate("/projects")}>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={projectPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={PieLabel}
                      onClick={() => navigate("/projects")} style={{ cursor: "pointer" }}>
                      {projectPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {projectPieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-sm text-gray-600">{d.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-sm font-bold text-slate-800">{totalProjects}</span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Row 2 — Leads line chart + Staff attendance radial */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 md:gap-5">
          <div className="w-full lg:w-1/2">
            <ChartCard title="Leads Overview" subtitle="Lead generation trends" icon={TrendingUp} iconColor="text-blue-500" delay={0.2} onClick={() => navigate("/enquiries")}>
              <div className="flex items-center justify-between mb-4 -mt-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  {["day", "week", "month"].map((v) => (
                    <button
                      key={v}
                      onClick={(e) => { e.stopPropagation(); setLeadsView(v); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        leadsView === v ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={getLeadsData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={40} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Staff Attendance */}
          <div className="w-full lg:w-1/2">
            <ChartCard title="Staff Attendance" subtitle="Today's attendance status" icon={Users} iconColor="text-green-500" delay={0.25} onClick={() => navigate("/staff")}>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={220}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={40} outerRadius={90} data={staffAttendanceData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#f1f5f9" }} />
                    <Tooltip {...tooltipStyle} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <p className="text-xs text-gray-500">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{totalStaff}</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-3 flex items-center gap-3">
                    <UserCheck size={18} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Present</p>
                      <p className="text-lg font-bold text-green-600">{presentStaff}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-3 flex items-center gap-3">
                    <UserX size={18} className="text-red-600 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Absent</p>
                      <p className="text-lg font-bold text-red-600">{absentStaff}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Row 3 — Enquiry status bar + Activity status bar */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 md:gap-5">
          <div className="w-full lg:w-1/2">
            <ChartCard title="Enquiry Status" subtitle="Breakdown by current status" icon={FileText} iconColor="text-cyan-500" delay={0.3} onClick={() => navigate("/enquiries")}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={enquiryStatusData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={40} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Enquiries" radius={[8, 8, 0, 0]} onClick={() => navigate("/enquiries")} style={{ cursor: "pointer" }}>
                    {enquiryStatusData.map((entry) => {
                      const colors = { New: "#3b82f6", "Follow Up": "#f59e0b", Closed: "#6b7280" };
                      return <Cell key={entry.status} fill={colors[entry.status] ?? "#6366f1"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="w-full lg:w-1/2">
            <ChartCard title="Activity Status" subtitle="System activity breakdown" icon={ClipboardList} iconColor="text-purple-500" delay={0.35} onClick={() => navigate("/activity")}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={activityStatusData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={40} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Activities" radius={[8, 8, 0, 0]} onClick={() => navigate("/activity")} style={{ cursor: "pointer" }}>
                    {activityStatusData.map((entry) => {
                      const colors = {
                        Create: "#22c55e",
                        Update: "#f59e0b",
                        Delete: "#ef4444",
                        Read: "#3b82f6",
                        New: "#3b82f6",
                        Approved: "#22c55e",
                        Pending: "#f59e0b",
                        Completed: "#6366f1",
                        Rejected: "#ef4444"
                      };
                      return <Cell key={entry.status} fill={colors[entry.status] ?? "#94a3b8"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Row 4 — Feedback rating bar + Staff performance bar */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 md:gap-5">
          <div className="w-full lg:w-1/2">
            <ChartCard title="Customer Feedback" subtitle="Ratings: Bad · Good · Excellent" icon={Users} iconColor="text-pink-500" delay={0.4} onClick={() => navigate("/feedback")}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={feedbackRatingData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={40} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Feedback" radius={[8, 8, 0, 0]} onClick={() => navigate("/feedback")} style={{ cursor: "pointer" }}>
                    {feedbackRatingData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center justify-center gap-5 mt-3">
                {feedbackRatingData.map((d) => (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-500">{d.label} ({d.count})</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="w-full lg:w-1/2">
            <ChartCard title="Staff Performance" subtitle="Completed vs pending tasks per member" icon={Users} iconColor="text-green-500" delay={0.45} onClick={() => navigate("/tasks")}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={staffPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={40} />
                  <Tooltip {...tooltipStyle} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }} />
                  <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} name="Completed" />
                  <Bar dataKey="pending"   fill="#eab308" radius={[6, 6, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>


      </div>
    </AdminLayout>
  );
}

export default Dashboard;
