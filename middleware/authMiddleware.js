const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it's there
  let token;
  const headers = req.headers.authorization;

  if (headers && headers.startsWith('Bearer')) {
    token = headers.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }
  // 2) Validate / Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists (e.g the user may have deleted their account, therefore token should not work anymore)
  const freshUser = await User.findById(decoded.id).select('-password');
  if (!freshUser) {
    return next(new AppError('The user with this token no longer exists', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, Please log in again', 401)
    );
  }

  //grant access to protected route
  req.user = freshUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  // if (req.cookies.jwt) {
  //   try {
  //     // 1) verify token
  //     const decoded = await promisify(jwt.verify)(
  //       req.cookies.jwt,
  //       process.env.JWT_SECRET
  //     );
  //     // 2) Check if user still exists
  //     const currentUser = await User.findById(decoded.id);
  //     if (!currentUser) {
  //       return next();
  //     }
  //     // 3) Check if user changed password after the token was issued
  //     if (currentUser.changedPasswordAfter(decoded.iat)) {
  //       return next();
  //     }
  //     // THERE IS A LOGGED IN USER
  //     res.locals.user = currentUser;
  //     return next();
  //   } catch (err) {
  //     return next();
  //   }
  // }
  // next();
};

//roles is an array [admin, lead-guide]
exports.restrictTo = (...roles) => {
  //middleware function itself
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};
