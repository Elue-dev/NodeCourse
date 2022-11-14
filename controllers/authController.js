const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  // recieves, payload(id), secret and options
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, //only be sent to an encrypted connection, i.e when we using https
    httpOnly: true, //ca only be modified in http i.e can't be accessed or modified by the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //remove password from the output - the one we did in the schema is to query for all users, here it comes from creating a new document
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // should passwordChangedAt show??
  const { name, role, email, password, passwordConfirm, passwordChangedAt } =
    req.body;

  const newUser = await User.create({
    name,
    role,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });

  const url = `http://localhost:3000/user/${name.replace(' ', '')}/${
    newUser._id
  }`;

  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }

  // 2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); //cus we removed it from the output in the model, but here we need it for validation

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  // 3) if everything is okay, send the token
  createAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email }); //not findById cuz we don't now the user's ID
  if (!user) {
    return next(new AppError('There is no user with that email address'), 404);
  }

  // 2) generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // because for the passwordResetExpires that we defined in our user model, we didnt save it, we just modified it.  validateBeforeSave: false  deactivates all the validators we specified in our schema

  try {
    // 3) send back as an email to user.
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'A password reset token has been sent to your email',
    });
  } catch (error) {
    //remember, this goes to database, and again, it just modifies, just saves, so we save it after
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(error, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token, we have to encrypt the one not in the database, so we compare both (because, remember the one we have in our database is ecrypted)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //we will also check if passwordResetExpires is greater than now
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 2) if token has not expired, and there is a user, then set new password
  //set whatever user sends as new password and confirm password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //delete password reset token and expired
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //we wont disable validation cuz we need it eg for password confirm

  // 3) update changedPasswordAt property for the user
  // 4) log user in, send jwt to client

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user. note: we didnt use findByIdAndUpdate because in update, the user password is not defined, so anything relating to password, don't use update
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if current posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is wrong..', 401));
  }

  // 3) if password is correct then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in, send JWT
  createAndSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: Number(new Date(Date.now() * 10 * 1000)),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
});
