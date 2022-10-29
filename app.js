const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' })); // middleware: function to modify the incoming request data - we using express.json() to get the request body on the response object. (also called Body Parser)

// data sanitization against NOSQL query injection
app.use(mongoSanitize()); // filters out dollar signs and dots from req params, body and query strings.

// data sanitization against cross site scripting attacks
app.use(xss()); // clean user input from malicious html code

// prevent parameter pollution, e.g duplicate query strings (?sort=duration&sort=price), it will take the last one
// whitelist: array of properties for which we allow duplicates in query string, why whitelist? because there are some fields we want duplicates query strings
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(express.static(`${__dirname}/public`)); // serving static files (creating routes for static files, eg index.html file in public folder)

// middleware - applies to every single request, cuz we didn't specify any route
//REMEMBER - the order matters

// GLOBAL MIDDLEWARES
// set security http headers
app.use(helmet()); //put in beginning of middlewares

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//how many requests per IP would be allowed
const limiter = rateLimit({
  //the options below will allow 100 requests from same IP in 1hr
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});

app.use('/api', limiter); //this will affect all the routes that starts with /api

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
