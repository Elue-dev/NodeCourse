const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes. add the below in case they are not specified in the request body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //from protect middleware

  next();
};

exports.createReview = factory.createOne(Review);

exports.getReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.getUserReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  let usersArray = [];

  const userReviews = usersArray.find((rev) => rev._id === req.user._id);

  res.status(200).json({
    status: 'success',
    data: userReviews,
  });
});
