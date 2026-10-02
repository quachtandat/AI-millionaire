import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiError } from '../../services/api';
import { historyService } from '../../services/history.service';

export const loadHistory = createAsyncThunk('history/load', async (_, { rejectWithValue }) => {
  try { return await historyService.getGameHistory(); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const loadGameDetail = createAsyncThunk('history/detail', async (gameId, { rejectWithValue }) => {
  try { return await historyService.getGameDetail(gameId); } catch (error) { return rejectWithValue(getApiError(error)); }
});

const slice = createSlice({
  name: 'history', initialState: { games: [], detail: null, loading: false, detailLoading: false, error: null },
  reducers: { clearHistoryError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(loadHistory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadHistory.fulfilled, (state, action) => { state.loading = false; state.games = action.payload; })
      .addCase(loadHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loadGameDetail.pending, (state) => { state.detailLoading = true; state.error = null; state.detail = null; })
      .addCase(loadGameDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload; })
      .addCase(loadGameDetail.rejected, (state, action) => { state.detailLoading = false; state.error = action.payload; });
  },
});
export const { clearHistoryError } = slice.actions;
export default slice.reducer;
