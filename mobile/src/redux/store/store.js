import { configureStore } from '@reduxjs/toolkit';
import authReducer, { sessionExpired } from '../slices/authSlice';
import gameReducer from '../slices/gameSlice';
import historyReducer from '../slices/historySlice';
import rankingReducer from '../slices/rankingSlice';
import profileReducer from '../slices/profileSlice';
import statisticsReducer from '../slices/statisticsSlice';
import adminReducer from '../slices/adminSlice';
import { setUnauthorizedHandler } from '../../services/api';

export const store = configureStore({
  reducer: { auth: authReducer, game: gameReducer, history: historyReducer, ranking: rankingReducer, profile: profileReducer, statistics: statisticsReducer, admin: adminReducer },
});

setUnauthorizedHandler(() => store.dispatch(sessionExpired()));
