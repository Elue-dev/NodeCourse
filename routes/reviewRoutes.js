const express = require('express');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// why mergeParams: true?? because by default, each router only has access to the parameters of their specific routes, and we want to get the tourId that was in the other router we defined in tour routes (line 15)
// so a route like this: // POST /api/v1/tours/4367trvx6rtcv6r/reviews or this: POST /reviews will all end up in line 12 below

router.use(protect);

router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
