const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // execute query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  //send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getSingleTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id}) another way to do it.

  if (!tour) {
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newTour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //new updated doc would be the one that would be returned
    runValidators: true,
  });
  // Tour.findOne({_id: req.params.id}) another way to do it.

  if (!tour) {
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    updatedTour: tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

// AGGREGATION PIPELINES
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        // _id: { $toUpper: '$difficulty' }, //uppercase
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // use field names from group
      $sort: { avgPrice: 1 }, //ascending
    },
    // {
    //   // you can repeat stages...
    //   $match: { _id: { $ne: 'easy' } }, // not equal to
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      // unwind deconstructs an array field from the input doc. and then outputs one doc. for each element of the array
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // between first day and last day of the current year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 12, //remove 12
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
