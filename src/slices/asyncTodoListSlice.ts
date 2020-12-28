import { createSlice, createSelector, createAsyncThunk, SerializedError } from "@reduxjs/toolkit";
import { RootState } from '../reducers';

const asyncMessage = (message: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(message);
    }, 1000);
  });
};

export const asyncAddTodo = createAsyncThunk(
  'asyncAddTodo',
  async (message: string, { getState, requestId }) => {
    const { currentRequestId, pending } = (getState() as RootState).asyncTodoList
    if (!pending || requestId !== currentRequestId) {
      throw new Error('Promise resolution is not finished.');
    }
    const result = await asyncMessage(message);
    return result;
  }
);

const asyncTodoListSlice = createSlice({
  name: "asyncTodoList",
  initialState: {
    pending: false,
    currentRequestId: undefined as string | undefined,
    error: null as SerializedError | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncAddTodo.pending, (state, action) => {
      if (!state.pending) {
        state.pending = true
        state.currentRequestId = action.meta.requestId
      }
    })
    builder.addCase(asyncAddTodo.fulfilled, (state, action) => {
      const { requestId } = action.meta
      if (state.pending && state.currentRequestId === requestId) {
        state.pending = false;
        state.currentRequestId = undefined;
      }
    })
    builder.addCase(asyncAddTodo.rejected, (state, action) => {
      const { requestId } = action.meta
      if (state.pending && state.currentRequestId === requestId) {
        state.pending = false;
        state.error = action.error;
        state.currentRequestId = undefined;
      }
    })
  }
});

const stateSelector = (state: RootState) => state.asyncTodoList;

export const selectors = {
  isPendingSelector: createSelector(
    stateSelector,
    state => state.pending
  ),
};

export default asyncTodoListSlice.reducer;
