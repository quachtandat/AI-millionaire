import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiError } from '../../services/api';
import { adminService } from '../../services/admin.service';

const uniqueQuestionsById = (questions) => [...new Map(questions.map((question) => [String(question.id), question])).values()];

const upsertQuestion = (questions, question) => {
  const index = questions.findIndex((item) => String(item.id) === String(question.id));
  if (index >= 0) questions[index] = question;
  else questions.unshift(question);
};

export const loadAdminData = createAsyncThunk('admin/load', async (params = {}, { rejectWithValue }) => {
  const page = typeof params === 'number' ? params : params.page || 1;
  const filters = typeof params === 'number' ? {} : params.filters || {};
  try {
    const [categories, result, drafts] = await Promise.all([adminService.getCategories(), adminService.getQuestions(page, filters), adminService.getAIDrafts()]);
    return { categories, ...result, drafts, page, filters };
  } catch (error) { return rejectWithValue(getApiError(error)); }
});

export const createAdminCategory = createAsyncThunk('admin/createCategory', async (category, { rejectWithValue }) => {
  try { return await adminService.createCategory(category); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const loadAdminQuestion = createAsyncThunk('admin/loadQuestion', async (id, { rejectWithValue }) => {
  try { return await adminService.getQuestion(id); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const saveAdminQuestion = createAsyncThunk('admin/saveQuestion', async (question, { rejectWithValue }) => {
  try {
    return question.id ? await adminService.updateQuestion(question) : await adminService.createQuestion(question);
  } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const deleteAdminQuestion = createAsyncThunk('admin/deleteQuestion', async (id, { rejectWithValue }) => {
  try { return await adminService.deleteQuestion(id); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const reviewAIDraft = createAsyncThunk('admin/reviewAIDraft', async (payload, { rejectWithValue }) => {
  try { return await adminService.reviewAIDraft(payload); } catch (error) { return rejectWithValue(getApiError(error)); }
});
export const generateAIDrafts = createAsyncThunk('admin/generateAIDrafts', async (payload, { rejectWithValue }) => {
  try { return await adminService.generateAIDrafts(payload); } catch (error) { return rejectWithValue(getApiError(error)); }
});

const slice = createSlice({
  name: 'admin',
  initialState: { categories: [], questions: [], drafts: [], pagination: null, filters: {}, loading: false, loadingQuestion: false, saving: false, error: null },
  reducers: { clearAdminError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(loadAdminData.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        const mergedQuestions = action.payload.page > 1 ? [...state.questions, ...action.payload.questions] : action.payload.questions;
        state.questions = uniqueQuestionsById(mergedQuestions);
        state.drafts = action.payload.drafts;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(loadAdminData.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAdminCategory.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(createAdminCategory.fulfilled, (state, action) => { state.saving = false; state.categories.push(action.payload); })
      .addCase(createAdminCategory.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(loadAdminQuestion.pending, (state) => { state.loadingQuestion = true; state.error = null; })
      .addCase(loadAdminQuestion.fulfilled, (state) => { state.loadingQuestion = false; })
      .addCase(loadAdminQuestion.rejected, (state, action) => { state.loadingQuestion = false; state.error = action.payload; })
      .addCase(saveAdminQuestion.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(saveAdminQuestion.fulfilled, (state, action) => {
        state.saving = false;
        const question = {
          ...action.payload,
          category_name: action.payload.category_name || state.categories.find((category) => String(category.id) === String(action.payload.category_id))?.name,
        };
        upsertQuestion(state.questions, question);
      })
      .addCase(saveAdminQuestion.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteAdminQuestion.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(deleteAdminQuestion.fulfilled, (state, action) => { state.saving = false; state.questions = state.questions.filter((item) => String(item.id) !== String(action.payload)); })
      .addCase(deleteAdminQuestion.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
    builder.addCase(reviewAIDraft.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(reviewAIDraft.fulfilled, (state, action) => {
        state.saving = false;
        state.drafts = state.drafts.filter((item) => String(item.id) !== String(action.payload.id));
        if (action.payload.status === 'approved') upsertQuestion(state.questions, action.payload);
      })
      .addCase(reviewAIDraft.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
    builder.addCase(generateAIDrafts.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(generateAIDrafts.fulfilled, (state, action) => { state.saving = false; state.drafts = [...action.payload, ...state.drafts]; })
      .addCase(generateAIDrafts.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
  },
});

export const { clearAdminError } = slice.actions;
export default slice.reducer;
