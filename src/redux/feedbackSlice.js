import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchFeedbackApi,
  createFeedbackApi,
  updateFeedbackApi,
  deleteFeedbackApi,
} from "../services/apiCalls";

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail))
    return data.detail.map((i) => i.msg).join(", ");
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;
  return fallback;
};

export const fetchFeedback = createAsyncThunk(
  "feedback/fetchFeedback",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchFeedbackApi();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch feedback"));
    }
  },
);

export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (feedbackData, { rejectWithValue }) => {
    try {
      const data = await createFeedbackApi(feedbackData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create feedback"));
    }
  },
);

export const updateFeedback = createAsyncThunk(
  "feedback/updateFeedback",
  async ({ id, feedbackData }, { rejectWithValue }) => {
    try {
      const data = await updateFeedbackApi(id, feedbackData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update feedback"));
    }
  },
);

export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (id, { rejectWithValue }) => {
    try {
      await deleteFeedbackApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete feedback"));
    }
  },
);

const feedbackSlice = createSlice({
  name: "feedback",
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
    clearFeedbackError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        state.items = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFeedback.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(updateFeedback.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(deleteFeedback.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearFeedbackError } = feedbackSlice.actions;
export default feedbackSlice.reducer;
