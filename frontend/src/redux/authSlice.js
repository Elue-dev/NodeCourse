import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
      state.user = action.payload;
    },
    REMOVE_ACTIVE_USER: (state) => {
      state.user = null;
    },
  },
});

export const { SET_ACTIVE_USER, REMOVE_ACTIVE_USER } = authSlice.actions;

export const getUser = (state) => state.auth.user;

export default authSlice.reducer;
