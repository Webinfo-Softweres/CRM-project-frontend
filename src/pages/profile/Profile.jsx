import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Activity,
  Calendar,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { fetchUserByIdApi } from "../../services/apiCalls";
import { fetchRoles } from "../../redux/roleSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { rolesData } from "../../data/rolesData";
import { departmentsData } from "../../data/departmentsData";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch roles and departments from redux state to map IDs
  const roles = useSelector((state) => state.roles.items);
  const departments = useSelector((state) => state.departments.items);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load lookup data
    dispatch(fetchRoles());
    dispatch(fetchDepartments());

    const verifyAndFetch = async () => {
      // Defer to avoid synchronous setState inside effect
      await Promise.resolve();

      const token = Cookies.get("access_token");
      if (!token) {
        setError("No active session found. Please log in.");
        setLoading(false);
        return;
      }

      // Strategy 1: read user_id cookie set at login time
      let userId = Cookies.get("user_id") ? Number(Cookies.get("user_id")) : null;

      // Strategy 2: decode the JWT and try multiple fields
      if (!userId) {
        try {
          const decoded = jwtDecode(token);
          console.debug("[Profile] Decoded JWT:", decoded);

          // Try numeric id fields first
          if (decoded.id && !isNaN(Number(decoded.id))) {
            userId = Number(decoded.id);
          } else if (decoded.user_id && !isNaN(Number(decoded.user_id))) {
            userId = Number(decoded.user_id);
          } else if (decoded.sub && !isNaN(Number(decoded.sub))) {
            // sub is numeric string
            userId = Number(decoded.sub);
          }
          // Note: if sub is an email we can't use it as user_id path param
        } catch (e) {
          console.error("Failed to decode token:", e);
          setError("Session verification failed. Please try logging in again.");
          setLoading(false);
          return;
        }
      }

      if (!userId) {
        setError(
          "Unable to determine your user ID. Please log out and log in again to refresh your session."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchUserByIdApi(userId);
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        const detail = err.response?.data?.detail;
        const status = err.response?.status;
        let msg;
        if (status === 422) {
          msg = "Unable to load profile: invalid user ID format. Please log out and log in again.";
        } else if (typeof detail === "string") {
          msg = detail;
        } else {
          msg = err.message || "Failed to load profile details.";
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [dispatch]);

  // Map role_id and department_id
  const getRoleName = () => {
    if (!user || user.role_id === undefined) return "Not assigned";
    const match = roles.find((r) => r.id === user.role_id) || rolesData.find((r) => r.id === user.role_id);
    return match ? match.role_name : `Role #${user.role_id}`;
  };

  const getDepartmentName = () => {
    if (!user || user.department_id === undefined) return "Not assigned";
    const match = departments.find((d) => d.id === user.department_id) || departmentsData.find((d) => d.id === user.department_id);
    return match ? match.name : `Department #${user.department_id}`;
  };

  const getInitials = () => {
    if (!user || !user.name) return "?";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center shadow-sm w-full max-w-lg animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading user profile...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center shadow-sm">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to Load Profile</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-2xl flex items-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const roleName = getRoleName();
  const departmentName = getDepartmentName();
  const userInitials = getInitials();
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "N/A";

  const profileCards = [
    {
      title: "Full Name",
      value: user.name || "N/A",
      icon: User,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Email Address",
      value: user.email || "N/A",
      icon: Mail,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Phone Number",
      value: user.phone || "N/A",
      icon: Phone,
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      title: "User Role",
      value: roleName,
      icon: ShieldCheck,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Department",
      value: departmentName,
      icon: Building2,
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
    {
      title: "Account Status",
      value: user.status || "Active",
      icon: Activity,
      color: user.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100",
    },
    {
      title: "Date Joined",
      value: joinedDate,
      icon: Calendar,
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* Cover image area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-36 md:h-52 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl overflow-hidden shadow-md"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        </motion.div>

        {/* Profile Header Overlap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative -mt-16 md:-mt-24 px-6 md:px-12 flex flex-col md:flex-row md:items-end gap-4 md:gap-6 pb-4 border-b border-slate-200"
        >
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg flex items-center justify-center text-white text-3xl md:text-4xl font-bold select-none shrink-0">
            {userInitials}
          </div>
          <div className="mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} />
                {roleName}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${
                user.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                <Activity size={12} />
                {user.status || "Active"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {profileCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`p-3 rounded-2xl border ${card.color} shrink-0`}>
                <card.icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-base font-semibold text-slate-800 mt-1 truncate">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Welcome Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl border border-slate-200/60 p-6 md:p-8"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-2">Welcome to CRM Workflow</h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            This profile contains your registered account credentials and administrative assignment info. For modifications, security configurations, or permissions adjustments, please contact the administrator.
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default Profile;
