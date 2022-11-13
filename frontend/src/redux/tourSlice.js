import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tours: null,
};

const tourSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    SET_TOURS: (state, action) => {
      state.tours = action.payload;
    },
  },
});

export const { SET_TOURS } = tourSlice.actions;

export const getTours = (state) => state.tours.tours;

export default tourSlice.reducer;
