import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ENDPOINTS } from "./endpoints";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "";

export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

API.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");

  if (token) {
    if (isTokenExpired(token)) {
      console.warn("Token expired. Logging out...");

      Cookies.remove("access_token");
      window.location.href = "/login";

      return Promise.reject("Token expired");
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const checkRoleApi = async (email) => {
  const res = await API.post(ENDPOINTS.CHECK_ROLE, { email });
  return res.data;
};

export const loginApi = async (data) => {
  const res = await API.post(ENDPOINTS.LOGIN, data);
  return res.data;
};

export const logoutApi = async () => {
  const res = await API.post(ENDPOINTS.LOGOUT);
  return res.data;
};

export const getProfileApi = async () => {
  const res = await API.get(ENDPOINTS.PROFILE);
  return res.data;
};

export const fetchUsersApi = async (args = {}) => {
  const {
    skip,
    limit,
    search = "",
    role_id = null,
    department_id = null,
    status = "",
  } = args || {};
  const params = new URLSearchParams();
  const skipVal = parseInt(skip, 10);
  const limitVal = parseInt(limit, 10);
  params.append("skip", isNaN(skipVal) ? 0 : skipVal);
  params.append("limit", isNaN(limitVal) ? 100 : limitVal);
  if (search) params.append("search", search);
  if (role_id && role_id !== "All") params.append("role_id", role_id);
  if (department_id && department_id !== "All") params.append("department_id", department_id);
  if (status && status !== "All") params.append("status", status);
  const res = await API.get(`${ENDPOINTS.USERS}?${params.toString()}`);
  return res.data;
};

export const fetchUserByIdApi = async (id) => {
  const res = await API.get(`${ENDPOINTS.USERS}${id}`);
  return res.data;
};

export const createUserApi = async (data) => {
  const res = await API.post(ENDPOINTS.USERS, data);
  return res.data;
};

export const fetchRolesApi = async () => {
  const res = await API.get(ENDPOINTS.ROLES);
  return res.data;
};

export const fetchDepartmentsApi = async () => {
  const res = await API.get(ENDPOINTS.DEPARTMENTS);
  return res.data;
};

export const updateUserApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.USERS}${id}`, data);
  return res.data;
};

export const deleteUserApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.USERS}${id}`);
  return res.data;
};

export const fetchPermissionsApi = async () => {
  const res = await API.get(ENDPOINTS.PERMISSIONS);
  return res.data;
};

export const createPermissionApi = async (data) => {
  const res = await API.post(ENDPOINTS.PERMISSIONS, data);
  return res.data;
};

export const deletePermissionApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.PERMISSIONS}${id}`);
  return res.data;
};

export const updatePermissionApi = async (id, data) => {
  const res = await API.patch(`${ENDPOINTS.PERMISSIONS}${id}`, data);
  return res.data;
};

export const fetchCustomersApi = async (args = {}) => {
  const {
    skip,
    limit,
    search = "",
    is_active = null,
  } = args || {};
  const params = new URLSearchParams();
  const skipVal = parseInt(skip, 10);
  const limitVal = parseInt(limit, 10);
  params.append("skip", isNaN(skipVal) ? 0 : skipVal);
  params.append("limit", isNaN(limitVal) ? 100 : limitVal);
  if (search) params.append("search", search);
  if (is_active !== null) params.append("is_active", is_active);
  const res = await API.get(`/customers?${params.toString()}`);
  return res.data;
};

export const createCustomerApi = async (data) => {
  const res = await API.post("/customers", data);
  return res.data;
};

export const updateCustomerApi = async (id, data) => {
  const res = await API.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomerApi = async (id) => {
  const res = await API.delete(`/customers/${id}`);
  return res.data;
};

export const fetchCustomerByIdApi = async (id) => {
  const res = await API.get(`${ENDPOINTS.CUSTOMERS}${id}`);
  return res.data;
};

export const fetchEnquiriesApi = async (args = {}) => {
  const {
    skip,
    limit,
    search = "",
  } = args || {};
  const params = new URLSearchParams();
  const skipVal = parseInt(skip, 10);
  const limitVal = parseInt(limit, 10);
  params.append("skip", isNaN(skipVal) ? 0 : skipVal);
  params.append("limit", isNaN(limitVal) ? 100 : limitVal);
  if (search) params.append("search", search);
  const res = await API.get(`${ENDPOINTS.ENQUIRIES}?${params.toString()}`);
  return res.data;
};

export const createEnquiryApi = async (data) => {
  const res = await API.post(ENDPOINTS.ENQUIRIES, data);
  return res.data;
};

export const updateEnquiryApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.ENQUIRIES}${id}`, data);
  return res.data;
};

export const deleteEnquiryApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.ENQUIRIES}${id}`);
  return res.data;
};

export const fetchQuotationsApi = async (args = {}) => {
  const {
    skip,
    limit,
    search = "",
  } = args || {};
  const params = new URLSearchParams();
  const skipVal = parseInt(skip, 10);
  const limitVal = parseInt(limit, 10);
  params.append("skip", isNaN(skipVal) ? 0 : skipVal);
  params.append("limit", isNaN(limitVal) ? 100 : limitVal);
  if (search) params.append("search", search);
  const res = await API.get(`${ENDPOINTS.QUOTATIONS}?${params.toString()}`);
  return res.data;
};

export const createQuotationApi = async (data) => {
  const res = await API.post(ENDPOINTS.QUOTATIONS, data);
  return res.data;
};

export const updateQuotationApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.QUOTATIONS}${id}`, data);
  return res.data;
};

export const deleteQuotationApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.QUOTATIONS}${id}`);
  return res.data;
};

export const approveQuotationApi = async (id) => {
  const res = await API.put(`${ENDPOINTS.QUOTATIONS}${id}/approve`);
  return res.data;
};

export const rejectQuotationApi = async (id) => {
  const res = await API.put(`${ENDPOINTS.QUOTATIONS}${id}/reject`);
  return res.data;
};

export const confirmQuotationApi = async (id) => {
  const res = await API.put(`${ENDPOINTS.QUOTATIONS}${id}/confirm`);
  return res.data;
};

export const fetchProjectsApi = async (args = {}) => {
  const {
    skip,
    limit,
    search = "",
  } = args || {};
  const params = new URLSearchParams();
  const skipVal = parseInt(skip, 10);
  const limitVal = parseInt(limit, 10);
  params.append("skip", isNaN(skipVal) ? 0 : skipVal);
  params.append("limit", isNaN(limitVal) ? 100 : limitVal);
  if (search) params.append("search", search);
  const res = await API.get(`${ENDPOINTS.PROJECTS}?${params.toString()}`);
  return res.data;
};

export const createProjectApi = async (data) => {
  const res = await API.post(ENDPOINTS.PROJECTS, data);
  return res.data;
};

export const updateProjectApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.PROJECTS}${id}`, data);
  return res.data;
};

export const deleteProjectApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.PROJECTS}${id}`);
  return res.data;
};

export const createTaskApi = async (data) => {
  const res = await API.post(ENDPOINTS.TASKS, data);
  return res.data;
};

export const fetchTasksApi = async (args = {}) => {
  const { skip, limit, search = "" } = args || {};
  const params = new URLSearchParams();
  if (skip !== undefined) params.append("skip", skip);
  if (limit !== undefined) params.append("limit", limit);
  if (search) params.append("search", search);
  const res = await API.get(`${ENDPOINTS.TASKS}?${params.toString()}`);
  return res.data;
};

export const fetchTaskByIdApi = async (id) => {
  const res = await API.get(`${ENDPOINTS.TASKS}${id}`);
  return res.data;
};

export const updateTaskApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.TASKS}${id}`, data);
  return res.data;
};

export const deleteTaskApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.TASKS}${id}`);
  return res.data;
};

export const fetchReportsApi = async (args = {}) => {
  const { skip, limit, search = "", report_date } = args || {};
  const params = new URLSearchParams();
  if (skip !== undefined) params.append("skip", skip);
  if (limit !== undefined) params.append("limit", limit);
  if (search) params.append("search", search);
  if (report_date) params.append("report_date", report_date);
  const res = await API.get(`${ENDPOINTS.REPORTS}?${params.toString()}`);
  return res.data;
};

export const createReportApi = async (data) => {
  const res = await API.post(ENDPOINTS.REPORTS, data);
  return res.data;
};

export const updateReportApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.REPORTS}${id}`, data);
  return res.data;
};

export const deleteReportApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.REPORTS}${id}`);
  return res.data;
};

export const fetchFeedbackApi = async (skip = 0, limit = 100) => {
  const res = await API.get(
    `${ENDPOINTS.FEEDBACK}?skip=${skip}&limit=${limit}`,
  );
  return res.data;
};

export const createFeedbackApi = async (data) => {
  const res = await API.post(ENDPOINTS.FEEDBACK, data);
  return res.data;
};

export const updateFeedbackApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.FEEDBACK}${id}`, data);
  return res.data;
};

export const deleteFeedbackApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.FEEDBACK}${id}`);
  return res.data;
};

export const fetchNotificationsApi = async (skip = 0, limit = 100) => {
  const res = await API.get(
    `${ENDPOINTS.NOTIFICATIONS}?skip=${skip}&limit=${limit}`,
  );
  return res.data;
};

export const createNotificationApi = async (data) => {
  const res = await API.post(ENDPOINTS.NOTIFICATIONS, data);
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await API.put(`${ENDPOINTS.NOTIFICATIONS}${id}/mark-read`);
  return res.data;
};

export const fetchUnreadNotificationsApi = async (userId) => {
  const res = await API.get(`${ENDPOINTS.NOTIFICATIONS}user/${userId}/unread`);
  return res.data;
};

export const updateNotificationApi = async (id, data) => {
  const res = await API.put(`${ENDPOINTS.NOTIFICATIONS}${id}`, data);
  return res.data;
};

export const deleteNotificationApi = async (id) => {
  const res = await API.delete(`${ENDPOINTS.NOTIFICATIONS}${id}`);
  return res.data;
};

export const fetchActivityLogsApi = async (skip = 0, limit = 100, search = "") => {
  const query = `?skip=${skip}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const res = await API.get(`${ENDPOINTS.ACTIVITY_LOG}${query}`);
  return res.data;
};

export const fetchTodayAttendanceApi = async () => {
  const res = await API.get(`${ENDPOINTS.ATTENDANCE}today`);
  return res.data;
};

export const fetchMonthAttendanceApi = async (year, month) => {
  const res = await API.get(`${ENDPOINTS.ATTENDANCE}month?year=${year}&month=${month}`);
  return res.data;
};

export const fetchDashboardCountsApi = async () => {
  const res = await API.get(ENDPOINTS.DASHBOARD_COUNTS);
  return res.data;
};