import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchNotificationsApi,
  createNotificationApi,
  markNotificationReadApi,
  fetchUnreadNotificationsApi,
  updateNotificationApi,
  deleteNotificationApi,
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

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchNotificationsApi();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch notifications"));
    }
  },
);

export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {
      const data = await createNotificationApi(notificationData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create notification"));
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      const data = await markNotificationReadApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to mark notification as read"));
    }
  },
);

export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnreadNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchUnreadNotificationsApi(userId);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch unread notifications"));
    }
  },
);

export const updateNotification = createAsyncThunk(
  "notifications/updateNotification",
  async ({ id, notificationData }, { rejectWithValue }) => {
    try {
      const data = await updateNotificationApi(id, notificationData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update notification"));
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete notification"));
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadItems: [],
    loading: false,
    unreadLoading: false,
    error: null,
    createLoading: false,
    createError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null,
  },
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNotification.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
        state.unreadItems = state.unreadItems.filter((item) => item.id !== action.payload.id);
      })
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.unreadLoading = true;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadItems = action.payload;
      })
      .addCase(fetchUnreadNotifications.rejected, (state) => {
        state.unreadLoading = false;
      })
      .addCase(updateNotification.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }

        // Sync with unreadItems
        if (action.payload.status?.toLowerCase() === "unread") {
          const uIndex = state.unreadItems.findIndex((item) => item.id === action.payload.id);
          if (uIndex > -1) {
            state.unreadItems[uIndex] = action.payload;
          } else {
            state.unreadItems.unshift(action.payload);
          }
        } else {
          state.unreadItems = state.unreadItems.filter((item) => item.id !== action.payload.id);
        }
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(deleteNotification.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.unreadItems = state.unreadItems.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
