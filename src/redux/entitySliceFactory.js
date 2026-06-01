import { createSlice } from "@reduxjs/toolkit";

const getNextId = (items) => {
  const maxId = items.reduce((max, item) => {
    const numericId = Number(item.id);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return maxId + 1;
};

export const createEntitySlice = ({ name, initialItems = [] }) => {
  const slice = createSlice({
    name,
    initialState: {
      items: initialItems,
      loading: false,
      error: null,
    },
    reducers: {
      setItems: (state, action) => {
        state.items = action.payload;
      },
      addItem: (state, action) => {
        state.items.push({
          id: action.payload.id ?? getNextId(state.items),
          ...action.payload,
        });
      },
      updateItem: (state, action) => {
        const { id, changes } = action.payload;
        const item = state.items.find((entry) => entry.id === id);

        if (item) Object.assign(item, changes);
      },
      removeItem: (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      },
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
      setError: (state, action) => {
        state.error = action.payload;
      },
    },
  });

  return slice;
};
