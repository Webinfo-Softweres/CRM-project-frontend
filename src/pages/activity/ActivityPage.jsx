import Pagination from "../../components/common/Pagination";
// src/pages/activity/ActivityPage.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchActivityLogs } from "../../redux/activitySlice";

import {
  Search,
  Filter,
  Activity,
  Clock3,
  User,
  FileText,
  ClipboardList,
  ReceiptText,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";
import AnimatedTableBody from "../../components/animations/AnimatedTableBody";
import AnimatedTableRow from "../../components/animations/AnimatedTableRow";
const PAGE_SIZE = 5;

// Module labels
const getModuleLabel = (module) => {
  if (!module) return "System";
  const m = module.toLowerCase();
  if (m === "enquiry") return "Enquiry";
  if (m === "quotation") return "Quotation";
  if (m === "task") return "Task";
  if (m === "customer") return "Customer";
  if (m === "project") return "Project";
  if (m === "feedback") return "Feedback";
  if (m === "report" || m === "reports") return "Work Report";
  if (m === "user" || m === "staff") return "Staff";
  return module.charAt(0).toUpperCase() + module.slice(1);
};

function ActivityPage() {
  const dispatch = useDispatch();
  const { items: activityList, loading, error } = useSelector((state) => state.activity);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [actionFilter, setActionFilter] = useState("All Actions");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch activities when searchQuery changes
  useEffect(() => {
    const params = { skip: 0, limit: 250 };
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchActivityLogs(params));
  }, [dispatch, searchQuery]);

  // Filter activities locally for module and action dropdowns
  const filteredActivities = activityList.filter((item) => {
    const moduleMatch =
      moduleFilter === "All Modules" ||
      getModuleLabel(item.module).toLowerCase() === moduleFilter.toLowerCase();
    
    // Check if the item status (which holds the action) contains the action filter text
    const actionMatch =
      actionFilter === "All Actions" ||
      String(item.status).toLowerCase().includes(actionFilter.toLowerCase());

    return moduleMatch && actionMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedData = filteredActivities.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === "new" || s === "create" || s === "add") return "bg-blue-100 text-blue-700";
    if (s === "approved" || s === "completed" || s === "read" || s === "success" || s === "view") return "bg-green-100 text-green-700";
    if (s === "rejected" || s === "delete" || s === "remove") return "bg-red-100 text-red-700";
    if (s === "pending" || s === "update" || s === "edit") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <AdminLayout>
      <AnimatedPage className="space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Activity Logs</h1>
          <p className="text-gray-500 mt-1">
            Track all status updates and workflow activities
          </p>
        </div>

        {/* Stats */}
        <AnimatedPage className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Total Logs */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Activities</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {activityList.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Activity className="text-blue-600" />
              </div>
            </div>
          </AnimatedCard>

          {/* Enquiries */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
            <p className="text-gray-500 text-sm">Enquiry Logs</p>
            <h2 className="text-3xl font-bold mt-2 text-blue-600">
              {activityList.filter((item) => item.module === "enquiry").length}
            </h2>
          </AnimatedCard>

          {/* Quotations */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
            <p className="text-gray-500 text-sm">Quotation Logs</p>
            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {activityList.filter((item) => item.module === "quotation").length}
            </h2>
          </AnimatedCard>

          {/* Tasks */}
          <AnimatedCard className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
            <p className="text-gray-500 text-sm">Task Logs</p>
            <h2 className="text-3xl font-bold mt-2 text-purple-600">
              {activityList.filter((item) => item.module === "task").length}
            </h2>
          </AnimatedCard>
        </AnimatedPage>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full xl:max-w-md">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by action, endpoint, method, IP address"
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="All Modules">All Modules</option>
                <option value="Enquiry">Enquiry</option>
                <option value="Quotation">Quotation</option>
                <option value="Task">Task</option>
                <option value="Customer">Customer</option>
                <option value="Project">Project</option>
                <option value="Feedback">Feedback</option>
                <option value="Work Report">Work Report</option>
                <option value="Staff">Staff</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="All Actions">All Actions</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
                <option value="Read">Read</option>
                <option value="Login">Login</option>
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && activityList.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error && activityList.length === 0 ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-3xl text-center border border-red-100 my-4">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => dispatch(fetchActivityLogs({ skip: 0, limit: 250 }))}
              className="mt-3 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* Activity Table */}
            {/* Activity Table */}
            <AnimatedPage className="hidden xl:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Module
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Record ID
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action/Status
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Changed By
                      </th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date & Time
                      </th>
                    </tr>
                  </thead>

                  <AnimatedTableBody>
                    {paginatedData.map((activity) => (
                      <AnimatedTableRow
                        key={activity.id}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                      >
                        {/* Module */}
                        <td className="p-5">
                          <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium inline-block">
                            {getModuleLabel(activity.module)}
                          </span>
                        </td>

                        {/* Record ID */}
                        <td className="p-5 text-sm text-slate-600 font-medium">
                          #{activity.record_id}
                        </td>

                        {/* Status */}
                        <td className="p-5">
                          <span
                            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-block ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {activity.status}
                          </span>
                        </td>

                        {/* Changed By */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                              {activity.changed_by?.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-700">{activity.changed_by}</span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="p-5 text-sm text-gray-600">
                          {activity.changed_at}
                        </td>
                      </AnimatedTableRow>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-gray-500 text-sm">
                          No matching activities found
                        </td>
                      </tr>
                    )}
                  </AnimatedTableBody>
                </table>
              </div>
            </AnimatedPage>

            {/* Activity Cards */}
            <div className="grid grid-cols-1 gap-4 xl:hidden">
              {paginatedData.map((activity) => (
                <AnimatedCard
                  key={activity.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {getModuleLabel(activity.module)}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-800">
                        Record #{activity.record_id}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                        {activity.changed_by?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{activity.changed_by}</p>
                        <p className="text-gray-500 text-xs">Changed By</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                      <Clock3 size={16} />
                      {activity.changed_at}
                    </div>
                    </div>
                  </AnimatedCard>
                ))}
              {paginatedData.length === 0 && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-gray-500 text-sm">
                  No matching activities found
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredActivities.length > PAGE_SIZE && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredActivities.length === 0
                      ? 0
                      : `${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filteredActivities.length)} of ${filteredActivities.length}`}
                  </span>{" "}
                  activities
                </p>

                <Pagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                  onPageChange={goToPage} 
                />
              </div>
            )}
          </>
        )}
      </AnimatedPage>
    </AdminLayout>
  );
}

export default ActivityPage;
