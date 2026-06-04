import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
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

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchCustomersApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch customers"),
      );
    }
  },
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const data = await createCustomerApi(customerData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create customer"),
      );
    }
  },
);

export const updateCustomerData = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const data = await updateCustomerApi(id, customerData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update customer"),
      );
    }
  },
);

export const deleteCustomerData = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCustomerApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete customer"),
      );
    }
  },
);

const customerSlice = createSlice({
  name: "customers",

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
    clearCustomerError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();

        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);
      })

      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCustomer.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })

      .addCase(createCustomer.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })

      .addCase(createCustomer.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      .addCase(updateCustomerData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })

      .addCase(updateCustomerData.fulfilled, (state, action) => {
        state.updateLoading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index > -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateCustomerData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      .addCase(deleteCustomerData.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })

      .addCase(deleteCustomerData.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(deleteCustomerData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearCustomerError } = customerSlice.actions;

export default customerSlice.reducer;
