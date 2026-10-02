import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiError } from '../../services/api';
import { profileService } from '../../services/profile.service';

export const loadProfile = createAsyncThunk('profile/load', async (_, { rejectWithValue }) => {
  try { return await profileService.getProfile(); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const saveProfile = createAsyncThunk('profile/save', async (profile, { rejectWithValue }) => {
  try { return await profileService.updateProfile(profile); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const uploadAvatar = createAsyncThunk('profile/avatar', async (file, { rejectWithValue }) => {
  try { return await profileService.uploadAvatar(file); } catch (error) { return rejectWithValue(getApiError(error)); }
});

const slice = createSlice({
  name: 'profile', initialState: { user: null, loading: false, saving: false, error: null },
  reducers: { clearProfileError(state) { state.error = null; } },
  extraReducers(builder) {
    builder.addCase(loadProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loadProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(saveProfile.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(saveProfile.fulfilled, (state, action) => { state.saving = false; state.user = action.payload; })
      .addCase(saveProfile.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(uploadAvatar.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(uploadAvatar.fulfilled, (state, action) => { state.saving = false; if (state.user) state.user.avatar_url = action.payload.avatar_url; })
      .addCase(uploadAvatar.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
  },
});
export const { clearProfileError } = slice.actions;
export default slice.reducer;
