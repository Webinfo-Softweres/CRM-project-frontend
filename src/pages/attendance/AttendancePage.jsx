import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layouts/AdminLayout";
import { motion } from "framer-motion";
import {
  Clock,
  Fingerprint,
  Search,
  ChevronDown,
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
                <p className="text-gray-500 text-sm">Total Punches</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">
                  {currentData?.total_punches || 0}
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
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                      Emp ID
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Employee Name
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[200px]">
                      Punch Type
                    </th>
                    <th className="text-left p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[240px]">
                      Punch Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
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
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                      >
                        <td className="p-5 font-medium text-slate-700">
                          #{record.employee_id}
                        </td>
                        <td className="p-5 font-semibold text-slate-800">
                          {record.employee_name || "Unknown User"}
                        </td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <Fingerprint size={12} />
                            {record.punch_type || "PUNCH"}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Calendar size={13} className="text-gray-400" />
                            {formatDate(record.punch_time)}
                          </div>
                        </td>
                      </tr>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">
                          {record.employee_name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          ID: #{record.employee_id}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {record.punch_type || "PUNCH"}
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span>{formatDate(record.punch_time)}</span>
                    </div>
                  </div>
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
