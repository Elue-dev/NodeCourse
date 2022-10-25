// const Tour = require('../model/tourModel');

// exports.aliasTopTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-ratingsAverage,price';
//   req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
//   next();
// };

// exports.getAllTours = async (req, res) => {
//   try {
//     // build query
//     const queryObj = { ...req.query };

//     // exclude special field names from our query string before we do the FILTERING
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // ADVANCED FILTERING
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gr|lte|lt)\b/g, (match) => `$${match}`);

//     let query = Tour.find(JSON.parse(queryStr));

//     // SORTING
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' ');
//       query = query.sort(sortBy);
//     } else {
//       // defaut - descending order of createdAt
//       query = query.sort('-createdAt');
//     }

//     // FIELD LIMITING
//     if (req.query.fields) {
//       const fields = req.query.fields.split(',').join(' ');
//       query = query.select(fields); //called projecting
//     } else {
//       query = query.select('-__v');
//     }

//     // PAGINATION
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 100;

//     //let's say we are requesting page number 3 with a limit of 10, it means we would have to sip 20 results (which is basically 2 * 10), so 2 times the limit
//     const skip = (page - 1) * limit;
//     // page=2&limit=10    skip - certain results before you start querying (1-10, 11-20, 21-30 etc...)
//     query = query.skip(skip).limit(limit);

//     if (req.query.page) {
//       const numberOfTours = await Tour.countDocuments();
//       if (skip >= numberOfTours) throw new Error('This page does not exist');
//     }

//     // execute query
//     const tours = await query;

//     //send response
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: tours,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// exports.getSingleTour = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     // Tour.findOne({_id: req.params.id}) another way to do it.

//     res.status(200).json({
//       status: 'success',
//       data: tour,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: `A tour with the id of ${req.params.id} does not exist`,
//     });
//   }
// };

// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: newTour,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, //new updated doc would be the one that would be returned
//       runValidators: true,
//     });
//     // Tour.findOne({_id: req.params.id}) another way to do it.

//     res.status(200).json({
//       status: 'success',
//       updatedTour: tour,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };
