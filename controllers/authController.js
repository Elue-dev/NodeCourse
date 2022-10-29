const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // recieves, payload(id), secret and options
  const token = generateToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
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

  // 3) send back as an email to user.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Reset it using this link: ${resetURL}. \n If you didnt forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email, //or req.body.email
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

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
    return next(new AppError('Token is ivalid or has expired', 400));
  }

  //set whatever user sends as new password and confirm password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //delete password reset token and expired
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //we wont disable validation cuz we need it eg for password confirm

  // 2) if token has not expired, and there is a user, the set new password
  // 3) update changedPasswordAt property for the user
  // 4) log user in, send jwt to client
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
