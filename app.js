const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // middleware: function to modify the incoming request data - we using express.json() to get the request body on the response object. (also called Body Parser)
app.use(express.static(`${__dirname}/public`)); // serving static files (creating routes for astatic files, eg index.html file in public folder)

// middleware - applies to every single request, cuz we didn't specify any route
//REMEMBER - the order matters

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  //next so that request - response cycle dosen't dosent get stuck in this midd. function
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter); //tourRouter & userRouter = middleware
app.use('/api/v1/users', userRouter);

// handle any route that dosen't match
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
