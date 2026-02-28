// src/store/slices/gamificationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface GamificationState {
  xp:     { total: number; level: number; xp_to_next: number } | null;
  streak: { current: number; longest: number; last_entry: string | null } | null;
  badges: any[];
  leaderboard: { top10: any[]; my_rank: number | null; my_co2: number | null } | null;
  isLoading: boolean;
}

const initialState: GamificationState = {
  xp:          null,
  streak:      null,
  badges:      [],
  leaderboard: null,
  isLoading:   false,
};

export const fetchGamificationStatus = createAsyncThunk(
  'gamification/fetchStatus',
  async () => {
    const res = await api.get('/gamification/status/');
    return res.data;
  }
);

export const fetchBadges = createAsyncThunk(
  'gamification/fetchBadges',
  async () => {
    const res = await api.get('/gamification/badges/');
    return res.data;
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async () => {
    const res = await api.get('/gamification/leaderboard/');
    return res.data;
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGamificationStatus.pending,   (s) => { s.isLoading = true; });
    builder.addCase(fetchGamificationStatus.fulfilled, (s, a) => {
      s.isLoading = false;
      s.xp        = a.payload.xp;
      s.streak    = a.payload.streak;
    });
    builder.addCase(fetchGamificationStatus.rejected,  (s) => { s.isLoading = false; });
    builder.addCase(fetchBadges.fulfilled,      (s, a) => { s.badges      = a.payload; });
    builder.addCase(fetchLeaderboard.fulfilled, (s, a) => { s.leaderboard = a.payload; });
  },
});

export default gamificationSlice.reducer;
