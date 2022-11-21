const express = require('express');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
  getCheckoutSession,
  createBookingCheckout,
  getUserBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourID', protect, getCheckoutSession);

router.post(
  '/save-booking/:tourID/:userID/:price',
  protect,
  createBookingCheckout
);

router.get('/my-bookings', protect, getUserBookings);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
