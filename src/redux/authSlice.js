import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { loginApi, logoutApi, checkRoleApi } from "../services/apiCalls";

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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await loginApi(userData);

      // New API returns { token, token_type, user }
      const token = data.token ?? data.access_token;
      const role  = data.user?.role ?? data.role?.role_name ?? null;

      Cookies.set("access_token", token, { expires: 7 });
      if (role) Cookies.set("role", role, { expires: 7 });
      // Store user ID for easy retrieval on page reload
      if (data.user?.id) Cookies.set("user_id", String(data.user.id), { expires: 7 });
      else if (data.id) Cookies.set("user_id", String(data.id), { expires: 7 });

      // Permissions may not be present in the new API — default to empty
      localStorage.setItem("permissions", JSON.stringify(data.permissions || []));

      return { ...data, token, resolvedRole: role };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  }
);

export const checkUserRole = createAsyncThunk(
  "auth/checkUserRole",
  async (email, { rejectWithValue }) => {
    try {
      const data = await checkRoleApi(email);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Role check failed"));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Logout failed"));
    } finally {
      // Clear all auth data
      Cookies.remove("access_token");
      Cookies.remove("role");
      Cookies.remove("user_id");
      localStorage.removeItem("permissions");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: Cookies.get("role") || null,
    permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
    loading: false,
    error: null,
    isAuthenticated: !!Cookies.get("access_token"),
    roleCheckLoading: false,
    roleCheckData: null,
  },
  reducers: {
    logout: (state) => {
      Cookies.remove("access_token");
      Cookies.remove("role");
      localStorage.removeItem("permissions");
      state.user = null;
      state.role = null;
      state.permissions = [];
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.role = action.payload.resolvedRole;
        state.permissions = action.payload.permissions || [];
        state.user = action.payload.user ?? action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.permissions = [];
        state.isAuthenticated = false;
        state.loading = false;
      })
      // ROLE CHECK
      .addCase(checkUserRole.pending, (state) => {
        state.roleCheckLoading = true;
      })
      .addCase(checkUserRole.fulfilled, (state, action) => {
        state.roleCheckLoading = false;
        state.roleCheckData = action.payload;
      })
      .addCase(checkUserRole.rejected, (state, action) => {
        state.roleCheckLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
