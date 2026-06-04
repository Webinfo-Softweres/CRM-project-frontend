import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTaskApi,
  fetchTasksApi,
  fetchTaskByIdApi,
  updateTaskApi,
  deleteTaskApi,
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

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchTasksApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch tasks"));
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchTaskByIdApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch task"));
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const data = await createTaskApi(taskData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create task"));
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const data = await updateTaskApi(id, taskData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update task"));
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await deleteTaskApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete task"));
    }
  },
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    currentTask: null,
    loading: false,
    error: null,
    currentTaskLoading: false,
    currentTaskError: null,
    createLoading: false,
    createError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null,
    lastFetched: null,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.currentTaskError = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.items ?? []);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.currentTaskLoading = true;
        state.currentTaskError = null;
        state.currentTask = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentTaskLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.currentTaskLoading = false;
        state.currentTaskError = action.payload;
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index > -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearTaskError, clearCurrentTask } = taskSlice.actions;

export default taskSlice.reducer;
