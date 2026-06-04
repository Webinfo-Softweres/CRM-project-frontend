import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDashboardCountsApi } from "../services/apiCalls";

export const fetchDashboardCounts = createAsyncThunk(
  "dashboard/fetchCounts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchDashboardCountsApi();
      if (data.status === "success") {
        return data;
      }
      return rejectWithValue("Failed to fetch dashboard counts");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch dashboard counts");
    }
  }
);

const initialState = {
  counts: {
    total_staff: 0,
    total_customers: 0,
    total_projects: 0,
    total_tasks: 0,
    present_staff: 0,
    absent_staff: 0,
  },
  projectStatusCounts: {
    completed: 0,
    ongoing: 0,
    hold: 0,
  },
  taskStatusCounts: {
    pending: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
  },
  enquiryStatusCounts: {
    new: 0,
    follow_up: 0,
    closed: 0,
  },
  activityLogCounts: {
    create: 0,
    read: 0,
    update: 0,
    delete: 0,
  },
  feedbackRatingCounts: {
    excellent: 0,
    good: 0,
    bad: 0,
  },
  staffPerformance: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload.counts;
        state.projectStatusCounts = action.payload.project_status_counts;
        state.taskStatusCounts = action.payload.task_status_counts;
        state.enquiryStatusCounts = action.payload.enquiry_status_counts;
        state.activityLogCounts = action.payload.activity_log_counts;
        state.feedbackRatingCounts = action.payload.feedback_rating_counts;
        state.staffPerformance = action.payload.staff_performance;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
