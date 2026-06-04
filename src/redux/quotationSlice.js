import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchQuotationsApi,
  createQuotationApi,
  updateQuotationApi,
  deleteQuotationApi,
  approveQuotationApi,
  rejectQuotationApi,
  confirmQuotationApi,
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

export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchQuotationsApi(params);
      return response.items || response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch quotations"),
      );
    }
  },
);

export const createQuotationData = createAsyncThunk(
  "quotations/createQuotation",
  async (quotationData, { rejectWithValue }) => {
    try {
      const data = await createQuotationApi(quotationData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create quotation"),
      );
    }
  },
);

export const updateQuotationData = createAsyncThunk(
  "quotations/updateQuotation",
  async ({ id, quotationData }, { rejectWithValue }) => {
    try {
      const data = await updateQuotationApi(id, quotationData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update quotation"),
      );
    }
  },
);

export const deleteQuotationData = createAsyncThunk(
  "quotations/deleteQuotation",
  async (id, { rejectWithValue }) => {
    try {
      await deleteQuotationApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete quotation"),
      );
    }
  },
);

export const approveQuotationData = createAsyncThunk(
  "quotations/approveQuotation",
  async (id, { rejectWithValue }) => {
    try {
      const data = await approveQuotationApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to approve quotation"),
      );
    }
  },
);

export const rejectQuotationData = createAsyncThunk(
  "quotations/rejectQuotation",
  async (id, { rejectWithValue }) => {
    try {
      const data = await rejectQuotationApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to reject quotation"),
      );
    }
  },
);

export const confirmQuotationData = createAsyncThunk(
  "quotations/confirmQuotation",
  async (id, { rejectWithValue }) => {
    try {
      const data = await confirmQuotationApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to confirm quotation"),
      );
    }
  },
);

const quotationSlice = createSlice({
  name: "quotations",
  initialState: {
    items: [],
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null,
    lastFetched: null,
  },
  reducers: {
    clearQuotationError: (state) => {
      state.error = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        state.items = action.payload;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuotationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuotationData.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createQuotationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateQuotationData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateQuotationData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateQuotationData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(deleteQuotationData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteQuotationData.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteQuotationData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      .addCase(approveQuotationData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(approveQuotationData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(approveQuotationData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(rejectQuotationData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(rejectQuotationData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(rejectQuotationData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(confirmQuotationData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(confirmQuotationData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(confirmQuotationData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearQuotationError } = quotationSlice.actions;

export default quotationSlice.reducer;

