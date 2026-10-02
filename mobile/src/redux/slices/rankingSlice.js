import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiError } from '../../services/api';
import { rankingService } from '../../services/ranking.service';

export const loadRanking = createAsyncThunk('ranking/load', async (_, { rejectWithValue }) => {
  try { return await rankingService.getRanking(); } catch (error) { return rejectWithValue(getApiError(error)); }
});
const slice = createSlice({
  name: 'ranking', initialState: { entries: [], loading: false, error: null },
  reducers: { clearRankingError(state) { state.error = null; } },
  extraReducers(builder) {
    builder.addCase(loadRanking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadRanking.fulfilled, (state, action) => { state.loading = false; state.entries = action.payload; })
      .addCase(loadRanking.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});
export const { clearRankingError } = slice.actions;
export default slice.reducer;
