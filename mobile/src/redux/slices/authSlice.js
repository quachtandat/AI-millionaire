import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { getApiError } from '../../services/api';
import { storage } from '../../utils/storage';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const result = await authService.login(credentials);
    await storage.setToken(result.token);
    return result;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const registerUser = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.register(credentials);
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    const token = await storage.getToken();
    if (!token) return null;
    const user = await authService.getCurrentUser();
    return { token, user };
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await storage.clearToken();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, initialized: false, error: null },
  reducers: {
    clearAuthError(state) { state.error = null; },
    sessionExpired(state) { state.user = null; state.token = null; state.loading = false; state.initialized = true; },
    updateCurrentUser(state, action) { if (state.user) state.user = { ...state.user, ...action.payload }; },
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.initialized = true; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(restoreSession.pending, (state) => { state.loading = true; })
      .addCase(restoreSession.fulfilled, (state, action) => { state.loading = false; state.initialized = true; state.user = action.payload?.user || null; state.token = action.payload?.token || null; })
      .addCase(restoreSession.rejected, (state, action) => { state.loading = false; state.initialized = true; state.user = null; state.token = null; state.error = action.payload; })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.token = null; state.error = null; });
  },
});

export const { clearAuthError, sessionExpired, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
