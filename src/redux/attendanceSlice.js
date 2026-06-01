import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTodayAttendanceApi, fetchMonthAttendanceApi } from "../services/apiCalls";

export const fetchTodayAttendance = createAsyncThunk(
  "attendance/fetchToday",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTodayAttendanceApi();
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Failed to fetch today's attendance");
    }
  }
);

export const fetchMonthAttendance = createAsyncThunk(
  "attendance/fetchMonth",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      return await fetchMonthAttendanceApi(year, month);
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Failed to fetch monthly attendance");
    }
  }
);

const initialState = {
  todayData: {
    status: "",
    total_punches: 0,
    attendance: []
  },
  monthData: {
    status: "",
    year: null,
    month: null,
    total_punches: 0,
    attendance: []
  },
  todayLoading: false,
  monthLoading: false,
  todayError: null,
  monthError: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceErrors: (state) => {
      state.todayError = null;
      state.monthError = null;
    },
  },
  extraReducers: (builder) => {
    // Today
    builder
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.todayLoading = true;
        state.todayError = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.todayLoading = false;
        state.todayData = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.todayLoading = false;
        state.todayError = action.payload;
      });

    // Month
    builder
      .addCase(fetchMonthAttendance.pending, (state) => {
        state.monthLoading = true;
        state.monthError = null;
      })
      .addCase(fetchMonthAttendance.fulfilled, (state, action) => {
        state.monthLoading = false;
        state.monthData = action.payload;
      })
      .addCase(fetchMonthAttendance.rejected, (state, action) => {
        state.monthLoading = false;
        state.monthError = action.payload;
      });
  },
});

export const { clearAttendanceErrors } = attendanceSlice.actions;
export default attendanceSlice.reducer;
