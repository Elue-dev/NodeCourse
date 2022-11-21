const stripe = require('stripe')(process.env.STRIPE_SK);
const catchAsync = require('../utils/catchAsync');
const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `http://localhost:3000/`,
    cancel_url: `http://localhost:3000/${req.params.tourID}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID, //allows us pass in some data about the sessio we are currently creating
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // because the amount is expected to be in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: 'payment',
  });

  // create response as session and send to client
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   console.log('running...');
//   const { tour, user, price } = req.query;
//   console.log(tour, user, price);

//   if (!tour && !user && !price) {
//     console.log('stopped running');

//     return next();
//   }

//   await Booking.create({ tour, user, price });

//   res.redirect('http://localhost:3000/');
// });

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tourID, userID, price } = req.params;
  console.log(tourID, userID, price);

  if (!tourID && !userID && !price) return next();

  const bookedTour = await Booking.create({
    tour: tourID,
    user: userID,
    price,
  });

  res.status(200).json({
    status: 'success',
    data: bookedTour,
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  // find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // find tours with the returned ids
  const tourIDs = bookings.map((e) => e.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: 'success',
    data: tours,
  });
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
