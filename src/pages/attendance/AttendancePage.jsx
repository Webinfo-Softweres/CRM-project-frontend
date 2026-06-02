import { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";
import { motion } from "framer-motion";
import {
  Clock,
  Fingerprint,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from "lucide-react";
import {
  fetchTodayAttendance,
  fetchMonthAttendance,
} from "../../redux/attendanceSlice";

const PAGE_SIZE = 8;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

function AttendancePage() {
  const dispatch = useDispatch();

  const [viewType, setViewType] = useState("Today");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );

  const {
    todayData,
    monthData,
    todayLoading,
    monthLoading,
    todayError,
    monthError,
  } = useSelector((state) => state.attendance);

  useEffect(() => {
    if (viewType === "Today") {
      dispatch(fetchTodayAttendance());
    } else if (viewType === "Monthly") {
      dispatch(
        fetchMonthAttendance({ year: selectedYear, month: selectedMonth })
      );
    }
  }, [dispatch, viewType, selectedYear, selectedMonth]);

  const currentData = viewType === "Today" ? todayData : monthData;
  const loading = viewType === "Today" ? todayLoading : monthLoading;
  const error = viewType === "Today" ? todayError : monthError;

  const rawAttendance = currentData?.attendance || [];

  const filteredData = rawAttendance.filter((record) => {
    if (!search) return true;
    const nameMatch = record.employee_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const idMatch = record.employee_id
      ?.toString()
      .toLowerCase()
      .includes(search.toLowerCase());
    return nameMatch || idMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <AdminLayout>
      <div className="space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Attendance
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage employee attendance punches
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {currentData?.total_users || 0}
                </h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Fingerprint className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Filtered Results</p>
                <h2 className="text-3xl font-bold mt-2 text-indigo-600">
                  {filteredData.length}
                </h2>
              </div>
              <div className="bg-indigo-100 p-4 rounded-2xl">
                <User className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 w-full md:w-96">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setExpandedRows({});
              }}
              placeholder="Search by name or ID..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <select
                value={viewType}
                onChange={(e) => {
                  setViewType(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
              >
                <option value="Today">Today's Attendance</option>
                <option value="Monthly">Monthly Report</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {viewType === "Monthly" && (
              <>
                <div className="relative w-full md:w-auto flex-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                <div className="relative w-full md:w-auto flex-1">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none border border-gray-300 rounded-2xl pl-5 pr-10 py-3 outline-none bg-white text-sm cursor-pointer w-full font-medium text-slate-700 truncate"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading attendance...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                {viewType === "Today" ? (
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">Emp ID</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Employee Name</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[150px]">Status</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[150px]">Work/Break Hrs</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[240px]">Latest Session</th>
                    </tr>
                  </thead>
                ) : (
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">Emp ID</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Employee Name</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">Present</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">Absent</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[150px]">Total Work Hrs</th>
                      <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[150px]">Full/Half Days</th>
                    </tr>
                  </thead>
                )}

                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={viewType === "Today" ? 5 : 6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Fingerprint size={48} className="text-gray-300" />
                          <h2 className="text-xl font-bold text-slate-700 mt-4">
                            No Records Found
                          </h2>
                          <p className="text-gray-500 mt-1 text-sm mb-4">
                            No attendance records match your filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((record, idx) => (
                      <Fragment key={idx}>
                        <tr
                          onClick={() => toggleRow(record.employee_id)}
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer"
                        >
                          <td className="p-5 font-medium text-slate-700">
                            <div className="flex items-center gap-2">
                              {expandedRows[record.employee_id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                              #{record.employee_id}
                            </div>
                          </td>
                          <td className="p-5 font-semibold text-slate-800">
                            {record.employee_name || "Unknown User"}
                          </td>
                          {viewType === "Today" ? (
                            <>
                              <td className="p-5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                                  record.attendance_status === "Full Day" 
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : record.attendance_status === "Half Day"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}>
                                  {record.attendance_status || (record.present ? "Present" : "Absent")}
                                </span>
                              </td>
                              <td className="p-5 text-sm font-medium text-slate-600">
                                <div className="flex flex-col gap-1">
                                  <span>{record.total_work_hours}h work</span>
                                  <span className="text-gray-400 text-xs">{record.total_break_hours}h break</span>
                                </div>
                              </td>
                              <td className="p-5 text-sm text-slate-500 whitespace-nowrap">
                                {record.sessions && record.sessions.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                      <Clock size={13} /> In: {formatDate(record.sessions[record.sessions.length - 1].punch_in).split(',')[1]?.trim() || "—"}
                                    </div>
                                    {record.sessions[record.sessions.length - 1].punch_out && (
                                      <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                                        <Clock size={13} /> Out: {formatDate(record.sessions[record.sessions.length - 1].punch_out).split(',')[1]?.trim() || "—"}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">No sessions</span>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-5 font-semibold text-emerald-600">
                                {record.present_days}
                              </td>
                              <td className="p-5 font-semibold text-red-500">
                                {record.absent_days}
                              </td>
                              <td className="p-5 font-semibold text-slate-700">
                                {record.total_work_hours}h
                              </td>
                              <td className="p-5 text-sm font-medium text-slate-600">
                                <div className="flex flex-col gap-1 text-xs">
                                  <span>Full: {record.full_days}</span>
                                  <span>Half: {record.half_days}</span>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                        {expandedRows[record.employee_id] && viewType === "Today" && (
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <td colSpan={5} className="p-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Work Sessions</h4>
                                  {record.sessions?.length > 0 ? (
                                    <div className="space-y-2">
                                      {record.sessions.map((sess, sIdx) => (
                                        <div key={sIdx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                          <div className="flex flex-col gap-1">
                                            <span className="text-emerald-600 font-medium flex items-center gap-1.5"><Clock size={14}/> In: {formatDate(sess.punch_in).split(',')[1]?.trim() || "—"}</span>
                                            <span className="text-red-500 font-medium flex items-center gap-1.5"><Clock size={14}/> Out: {sess.punch_out ? formatDate(sess.punch_out).split(',')[1]?.trim() : "—"}</span>
                                          </div>
                                          <span className="text-slate-600 font-semibold bg-slate-50 px-3 py-1 rounded-lg">{sess.work_hours}h</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">No work sessions recorded.</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Break Sessions</h4>
                                  {record.break_sessions?.length > 0 ? (
                                    <div className="space-y-2">
                                      {record.break_sessions.map((brk, bIdx) => (
                                        <div key={bIdx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                          <div className="flex flex-col gap-1">
                                            <span className="text-amber-600 font-medium flex items-center gap-1.5"><Clock size={14}/> Start: {formatDate(brk.break_start).split(',')[1]?.trim() || "—"}</span>
                                            <span className="text-amber-600 font-medium flex items-center gap-1.5"><Clock size={14}/> End: {brk.break_end ? formatDate(brk.break_end).split(',')[1]?.trim() : "—"}</span>
                                          </div>
                                          <span className="text-slate-600 font-semibold bg-slate-50 px-3 py-1 rounded-lg">{brk.break_hours}h</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">No break sessions recorded.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {expandedRows[record.employee_id] && viewType === "Monthly" && (
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <td colSpan={6} className="p-5">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Daily Breakdown</h4>
                              {record.daily_summary?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                  {record.daily_summary.map((day, dIdx) => (
                                    <div key={dIdx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-700">{day.date}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                          day.attendance_status === "Full Day" 
                                            ? "bg-emerald-100 text-emerald-700"
                                            : day.attendance_status === "Half Day"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                          {day.attendance_status || (day.present ? "Present" : "Absent")}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Work: <span className="font-semibold text-slate-700">{day.total_work_hours}h</span></span>
                                        <span>Break: <span className="font-semibold text-slate-700">{day.total_break_hours}h</span></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No daily records found.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Mobile Grid/Cards View */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedData.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 py-16 flex flex-col items-center justify-center shadow-sm">
                <Fingerprint size={48} className="text-gray-300" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  No Records Found
                </h2>
                <p className="text-gray-500 mt-1 text-sm mb-4">
                  No attendance records match your filters.
                </p>
              </div>
            ) : (
              paginatedData.map((record, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => toggleRow(record.employee_id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="pt-1">
                        {expandedRows[record.employee_id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">
                          {record.employee_name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          ID: #{record.employee_id}
                        </p>
                      </div>
                    </div>

                    {viewType === "Today" ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 ${
                        record.attendance_status === "Full Day" 
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : record.attendance_status === "Half Day"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {record.attendance_status || (record.present ? "Present" : "Absent")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {record.total_work_hours}h
                      </span>
                    )}
                  </div>

                  {viewType === "Today" ? (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-gray-500 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Work: <span className="text-slate-700">{record.total_work_hours}h</span></span>
                        <span>Break: <span className="text-slate-700">{record.total_break_hours}h</span></span>
                      </div>
                      {record.sessions && record.sessions.length > 0 && !expandedRows[record.employee_id] && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-600">In: {(formatDate(record.sessions[record.sessions.length - 1].punch_in).split(',')[1] || formatDate(record.sessions[record.sessions.length - 1].punch_in)).trim()}</span>
                          {record.sessions[record.sessions.length - 1].punch_out && (
                            <span className="text-red-500">Out: {(formatDate(record.sessions[record.sessions.length - 1].punch_out).split(',')[1] || formatDate(record.sessions[record.sessions.length - 1].punch_out)).trim()}</span>
                          )}
                        </div>
                      )}
                      
                      {expandedRows[record.employee_id] && (
                        <div className="flex flex-col gap-4 mt-2">
                          {record.sessions?.length > 0 && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Work Sessions</h4>
                              <div className="space-y-2">
                                {record.sessions.map((sess, sIdx) => (
                                  <div key={sIdx} className="flex flex-col gap-1 text-[11px] bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                    <div className="flex justify-between">
                                      <span className="text-emerald-600 flex items-center gap-1"><Clock size={12}/> In: {formatDate(sess.punch_in).split(',')[1]?.trim() || "—"}</span>
                                      <span className="text-slate-600 font-bold">{sess.work_hours}h</span>
                                    </div>
                                    {sess.punch_out && <span className="text-red-500 flex items-center gap-1"><Clock size={12}/> Out: {formatDate(sess.punch_out).split(',')[1]?.trim() || "—"}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {record.break_sessions?.length > 0 && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Break Sessions</h4>
                              <div className="space-y-2">
                                {record.break_sessions.map((brk, bIdx) => (
                                  <div key={bIdx} className="flex flex-col gap-1 text-[11px] bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                    <div className="flex justify-between">
                                      <span className="text-amber-600 flex items-center gap-1"><Clock size={12}/> Start: {formatDate(brk.break_start).split(',')[1]?.trim() || "—"}</span>
                                      <span className="text-slate-600 font-bold">{brk.break_hours}h</span>
                                    </div>
                                    {brk.break_end && <span className="text-amber-600 flex items-center gap-1"><Clock size={12}/> End: {formatDate(brk.break_end).split(',')[1]?.trim() || "—"}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-gray-500 font-medium">
                      {!expandedRows[record.employee_id] ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-600">Present: {record.present_days}</span>
                            <span>Full: {record.full_days}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-500">Absent: {record.absent_days}</span>
                            <span>Half: {record.half_days}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase">Daily Breakdown</h4>
                          {record.daily_summary?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                              {record.daily_summary.map((day, dIdx) => (
                                <div key={dIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-700">{day.date}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                                      day.attendance_status === "Full Day" 
                                        ? "bg-emerald-100 text-emerald-700"
                                        : day.attendance_status === "Half Day"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                      {day.attendance_status || (day.present ? "Present" : "Absent")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                                    <span>Work: <span className="font-semibold text-slate-700">{day.total_work_hours}h</span></span>
                                    <span>Break: <span className="font-semibold text-slate-700">{day.total_break_hours}h</span></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400">No daily records found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredData.length === 0
                  ? 0
                  : `${startIndex + 1}–${Math.min(
                      startIndex + PAGE_SIZE,
                      filteredData.length
                    )} of ${filteredData.length}`}
              </span>{" "}
              records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                      safePage === page
                        ? "bg-blue-600 text-white shadow"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AttendancePage;
