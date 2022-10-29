const express = require('express');
const tourController = require('../controllers/tourController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

const {
  getAllTours,
  createTour,
  getSingleTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = tourController;

// ALIASING
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// AGGREGATION PIPELINE
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

// param middleware, defined in tour controller
router.route('/').get(protect, getAllTours).post(createTour);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
