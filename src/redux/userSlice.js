import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createUserApi, fetchUsersApi, updateUserApi, deleteUserApi } from "../services/apiCalls";

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

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchUsersApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch users"));
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await createUserApi(userData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create user"));
    }
  },
);

export const updateUserData = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const data = await updateUserApi(id, userData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update user"));
    }
  },
);

export const deleteUserData = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteUserApi(id);
      return { id, data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete user"));
    }
  },
);

const userSlice = createSlice({
  name: "users",
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
  },
  reducers: {
    updateUser: (state, action) => {
      const { id, changes } = action.payload;
      const user = state.items.find((item) => item.id === id);

      if (user) Object.assign(user, changes);
    },
    clearUserError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // API returns { items: [...], total, page, limit, pages }
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(updateUserData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(deleteUserData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUserData.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteUserData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { updateUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
