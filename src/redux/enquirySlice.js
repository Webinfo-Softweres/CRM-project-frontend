import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchEnquiriesApi,
  createEnquiryApi,
  updateEnquiryApi,
  deleteEnquiryApi,
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

export const fetchEnquiries = createAsyncThunk(
  "enquiries/fetchEnquiries",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchEnquiriesApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch enquiries"),
      );
    }
  },
);

export const createEnquiry = createAsyncThunk(
  "enquiries/createEnquiry",
  async (enquiryData, { rejectWithValue }) => {
    try {
      const data = await createEnquiryApi(enquiryData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create enquiry"),
      );
    }
  },
);

export const updateEnquiryData = createAsyncThunk(
  "enquiries/updateEnquiry",
  async ({ id, enquiryData }, { rejectWithValue }) => {
    try {
      const data = await updateEnquiryApi(id, enquiryData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update enquiry"),
      );
    }
  },
);

export const deleteEnquiryData = createAsyncThunk(
  "enquiries/deleteEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEnquiryApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete enquiry"),
      );
    }
  },
);

const enquirySlice = createSlice({
  name: "enquiries",

  initialState: {
    items: [],
    loading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,

    error: null,
    createError: null,
    updateError: null,
    deleteError: null,
    lastFetched: null,
  },

  reducers: {
    clearEnquiryError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();

        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);
      })

      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createEnquiry.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })

      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })

      .addCase(createEnquiry.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      .addCase(updateEnquiryData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })

      .addCase(updateEnquiryData.fulfilled, (state, action) => {
        state.updateLoading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index > -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateEnquiryData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      .addCase(deleteEnquiryData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })

      .addCase(deleteEnquiryData.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(deleteEnquiryData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearEnquiryError } = enquirySlice.actions;

export default enquirySlice.reducer;
