// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import emissionReducer   from './slices/emissionSlice';
import gamificationReducer from './slices/gamificationSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    emissions:     emissionReducer,
    gamification:  gamificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
