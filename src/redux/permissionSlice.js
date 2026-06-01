import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchPermissionsApi,
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
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

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPermissionsApi();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch permissions"));
    }
  },
);

export const createPermission = createAsyncThunk(
  "permissions/createPermission",
  async (permissionData, { rejectWithValue }) => {
    try {
      const data = await createPermissionApi(permissionData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create permission"));
    }
  },
);

export const updatePermissionData = createAsyncThunk(
  "permissions/updatePermission",
  async ({ id, permissionData }, { rejectWithValue }) => {
    try {
      const data = await updatePermissionApi(id, permissionData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update permission"));
    }
  },
);

export const deletePermissionData = createAsyncThunk(
  "permissions/deletePermission",
  async (id, { rejectWithValue }) => {
    try {
      await deletePermissionApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete permission"));
    }
  },
);

const permissionSlice = createSlice({
  name: "permissions",
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
    clearPermissionError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE
      .addCase(createPermission.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // UPDATE
      .addCase(updatePermissionData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePermissionData.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePermissionData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // DELETE
      .addCase(deletePermissionData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deletePermissionData.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePermissionData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearPermissionError } = permissionSlice.actions;
export default permissionSlice.reducer;
