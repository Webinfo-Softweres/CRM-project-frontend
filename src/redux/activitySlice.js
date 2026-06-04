// src/redux/activitySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchActivityLogsApi } from "../services/apiCalls";

const getErrorMessage = (error, fallbackMessage) => {
  const data = error.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;

  return fallbackMessage;
};

export const fetchActivityLogs = createAsyncThunk(
  "activity/fetchActivityLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100, search = "" } = params;
      const data = await fetchActivityLogsApi(skip, limit, search);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch activity logs"));
    }
  }
);

const getModuleFromEndpoint = (endpoint) => {
  if (!endpoint) return "System";
  const path = endpoint.toLowerCase();
  if (path.includes("/enquiries")) return "enquiry";
  if (path.includes("/quotations")) return "quotation";
  if (path.includes("/tasks")) return "task";
  if (path.includes("/customers")) return "customer";
  if (path.includes("/projects")) return "project";
  if (path.includes("/feedback")) return "feedback";
  if (path.includes("/reports")) return "report";
  if (path.includes("/users")) return "user";
  if (path.includes("/auth")) return "auth";
  return "other";
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Unknown Date";
  try {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj.getTime())) return timestamp;
    const day = dateObj.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year} - ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  } catch (e) {
    return timestamp;
  }
};

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    items: [], 
    total: 0,
    page: 1,
    limit: 100,
    pages: 1,
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
        
        const apiItems = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);

        if (apiItems.length === 0) {
          state.items = []; 
          state.total = 0;
          state.pages = 1;
        } else {
          state.items = apiItems.map((log) => ({
            id: log.id,
            module: getModuleFromEndpoint(log.endpoint),
            record_id: log.id,
            status: log.action?.name || log.action?.method || "Success",
            changed_by: log.user?.name || log.user?.email || "System",
            changed_at: formatTimestamp(log.timestamp),
            method: log.action?.method,
            endpoint: log.endpoint,
            actionName: log.action?.name,
            ip_address: log.ip_address || log.client_ip || log.ip || "-",
          }));
          state.total = action.payload?.total ?? apiItems.length;
          state.page = action.payload?.page ?? 1;
          state.limit = action.payload?.limit ?? 100;
          state.pages = action.payload?.pages ?? 1;
        }
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep fallback mock data on error so UI does not break
      });
  },
});

export default activitySlice.reducer;
