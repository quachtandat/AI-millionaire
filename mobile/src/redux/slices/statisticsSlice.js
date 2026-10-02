import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiError } from '../../services/api';
import { statisticsService } from '../../services/statistics.service';

export const loadStatistics = createAsyncThunk('statistics/load', async (_, { rejectWithValue }) => {
  try { return await statisticsService.getStatistics(); } catch (error) { return rejectWithValue(getApiError(error)); }
});
const slice = createSlice({
  name: 'statistics', initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loadStatistics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadStatistics.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(loadStatistics.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});
export default slice.reducer;
