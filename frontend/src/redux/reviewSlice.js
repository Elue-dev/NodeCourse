import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviews: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    SET_REVIEWS: (state, action) => {
      state.reviews = action.payload;
    },
  },
});

export const { SET_REVIEWS } = reviewSlice.actions;

export const getReviews = (state) => state.reviews.reviews;

export default reviewSlice.reducer;
