import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { gameService } from '../../services/game.service';
import { getApiError } from '../../services/api';

const toSafeQuestion = (question) => {
  if (!question) return null;
  return {
    id: question.question_id ?? question.id,
    text: question.question,
    options: { A: question.option_a, B: question.option_b, C: question.option_c, D: question.option_d },
    categoryName: question.category_name,
    difficulty: question.difficulty,
    prizeLevel: question.prize_level,
  };
};

export const startGame = createAsyncThunk('game/start', async (_, { rejectWithValue }) => {
  try { return await gameService.startGame(); } catch (error) { return rejectWithValue(getApiError(error)); }
});

export const answerQuestion = createAsyncThunk('game/answer', async (selectedAnswer, { getState, rejectWithValue }) => {
  try {
    const gameId = getState().game.game?.gameId ?? getState().game.game?.id;
    const result = await gameService.answerQuestion(gameId, selectedAnswer);
    const safeResult = { ...result };
    delete safeResult.correctAnswer;
    return { ...safeResult, question: toSafeQuestion(result.question) };
  } catch (error) { return rejectWithValue(getApiError(error)); }
});

export const timeoutCurrentGame = createAsyncThunk('game/timeout', async ({ expectedLevel }, { getState, rejectWithValue }) => {
  try {
    const gameId = getState().game.game?.gameId ?? getState().game.game?.id;
    return await gameService.timeoutGame(gameId, expectedLevel);
  } catch (error) { return rejectWithValue(getApiError(error)); }
});

export const stopGame = createAsyncThunk('game/stop', async (_, { getState, rejectWithValue }) => {
  try {
    const gameId = getState().game.game?.gameId ?? getState().game.game?.id;
    return await gameService.stopGame(gameId);
  } catch (error) { return rejectWithValue(getApiError(error)); }
});

export const activateLifeline = createAsyncThunk('game/lifeline', async (kind, { getState, rejectWithValue }) => {
  try {
    const gameId = getState().game.game?.gameId ?? getState().game.game?.id;
    return { kind, result: await gameService.useLifeline(gameId, kind) };
  } catch (error) { return rejectWithValue(getApiError(error)); }
});

const initialState = {
  game: null, currentQuestion: null, currentLevel: 1, currentPrize: 0,
  lifelines: { 'fifty-fifty': false, audience: false, phone: false },
  removedOptions: [], answerResult: null, lifelineResult: null,
  loading: false, answering: false, timingOut: false, lifelineLoading: false, error: null,
};

const gameSlice = createSlice({
  name: 'game', initialState,
  reducers: {
    clearGameError(state) { state.error = null; },
    clearGame() { return initialState; },
    clearLifelineResult(state) { state.lifelineResult = null; },
  },
  extraReducers(builder) {
    builder
      .addCase(startGame.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading = false;
        state.game = action.payload.game;
        state.currentLevel = action.payload.game.current_level || 1;
        state.currentPrize = action.payload.game.current_prize || 0;
        state.currentQuestion = toSafeQuestion(action.payload.question);
        state.lifelines = { 'fifty-fifty': false, audience: false, phone: false };
      })
      .addCase(startGame.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(answerQuestion.pending, (state) => { state.answering = true; state.error = null; state.answerResult = null; })
      .addCase(answerQuestion.fulfilled, (state, action) => {
        state.answering = false;
        const result = action.payload;
        state.answerResult = result;
        state.currentLevel = result.currentLevel ?? state.currentLevel;
        state.currentPrize = result.currentPrize ?? state.currentPrize;
        state.currentQuestion = result.question || null;
        if (result.question) state.removedOptions = [];
        if (result.gameOver) state.game = { ...state.game, status: result.gameStatus };
      })
      .addCase(answerQuestion.rejected, (state, action) => { state.answering = false; state.error = action.payload; })
      .addCase(timeoutCurrentGame.pending, (state) => { state.timingOut = true; state.error = null; })
      .addCase(timeoutCurrentGame.fulfilled, (state, action) => {
        state.timingOut = false;
        if (!action.payload.timedOut) {
          if (action.payload.status && action.payload.status !== 'playing') {
            state.game = { ...state.game, status: action.payload.status };
            state.currentLevel = action.payload.currentLevel ?? state.currentLevel;
            state.currentPrize = action.payload.currentPrize ?? state.currentPrize;
            state.answerResult = { gameOver: true, gameStatus: action.payload.status, currentLevel: state.currentLevel, currentPrize: state.currentPrize };
          }
          return;
        }
        state.game = { ...state.game, status: 'lost' };
        state.currentLevel = action.payload.currentLevel;
        state.currentPrize = action.payload.currentPrize;
        state.answerResult = { gameOver: true, gameStatus: 'lost', timedOut: true, currentLevel: state.currentLevel, currentPrize: state.currentPrize };
      })
      .addCase(timeoutCurrentGame.rejected, (state, action) => { state.timingOut = false; state.error = action.payload; })
      .addCase(stopGame.pending, (state) => { state.answering = true; state.error = null; })
      .addCase(stopGame.fulfilled, (state, action) => {
        state.answering = false;
        state.currentLevel = action.payload.currentLevel ?? state.currentLevel;
        state.currentPrize = action.payload.currentPrize ?? state.currentPrize;
        state.game = { ...state.game, status: action.payload.status };
        state.answerResult = { gameOver: true, gameStatus: action.payload.status, currentLevel: state.currentLevel, currentPrize: state.currentPrize };
      })
      .addCase(stopGame.rejected, (state, action) => { state.answering = false; state.error = action.payload; })
      .addCase(activateLifeline.pending, (state) => { state.lifelineLoading = true; state.error = null; state.lifelineResult = null; })
      .addCase(activateLifeline.fulfilled, (state, action) => {
        state.lifelineLoading = false;
        const { kind, result } = action.payload;
        state.lifelines[kind] = true;
        state.lifelineResult = result;
        if (kind === 'fifty-fifty') state.removedOptions = result.removedOptions || [];
      })
      .addCase(activateLifeline.rejected, (state, action) => { state.lifelineLoading = false; state.error = action.payload; });
  },
});

export const { clearGameError, clearGame, clearLifelineResult } = gameSlice.actions;
export { toSafeQuestion };
export default gameSlice.reducer;
