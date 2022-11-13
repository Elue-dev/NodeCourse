const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No document found with id: ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //new updated doc would be the one that would be returned
      runValidators: true,
    });
    // Tour.findOne({_id: req.params.id}) another way to do it.

    if (!doc) {
      return next(
        new AppError(`No document found with id: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      updatedTour: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    // Allow nested routes. add the below in case they are not specified in the request body
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id; //from protect middleware

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No document found with id: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getTour = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ slug: req.params.slug });

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No tour found with slug: ${req.params.slug}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    // const doc = await features.query.explain();

    //send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });
