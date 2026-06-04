import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchRolesApi } from "../services/apiCalls";

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

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRolesApi();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch roles"));
    }
  },
);

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roleSlice.reducer;
