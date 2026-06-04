import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchReportsApi,
  createReportApi,
  updateReportApi,
  deleteReportApi,
} from "../services/apiCalls";

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

export const fetchWorkReports = createAsyncThunk(
  "workReports/fetchWorkReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchReportsApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch work reports"),
      );
    }
  },
);

export const createWorkReport = createAsyncThunk(
  "workReports/createWorkReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const data = await createReportApi(reportData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create work report"),
      );
    }
  },
);

export const updateWorkReportData = createAsyncThunk(
  "workReports/updateWorkReport",
  async ({ id, reportData }, { rejectWithValue }) => {
    try {
      const data = await updateReportApi(id, reportData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update work report"),
      );
    }
  },
);

export const deleteWorkReportData = createAsyncThunk(
  "workReports/deleteWorkReport",
  async (id, { rejectWithValue }) => {
    try {
      await deleteReportApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete work report"),
      );
    }
  },
);

const workReportSlice = createSlice({
  name: "workReports",
  initialState: {
    items: [],
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null,
    lastFetched: null,
  },
  reducers: {
    clearWorkReportError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    // Keep local mutations if needed, using simple logic
    addWorkReport: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateWorkReport: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index > -1) {
        state.items[index] = { ...state.items[index], ...changes };
      }
    },
    removeWorkReport: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkReports.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);
      })
      .addCase(fetchWorkReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createWorkReport.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createWorkReport.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createWorkReport.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(updateWorkReportData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateWorkReportData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateWorkReportData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(deleteWorkReportData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteWorkReportData.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteWorkReportData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const {
  clearWorkReportError,
  addWorkReport,
  updateWorkReport,
  removeWorkReport,
} = workReportSlice.actions;

export default workReportSlice.reducer;
