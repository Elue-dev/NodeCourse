// const fs = require('fs');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((val) => {
    if (allowedFields.includes(val)) {
      newObj[val] = obj[val];
    }
  });
  return newObj;
};

// we will use this in as a middleware in the /me route, to be able to get id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user tries to update password or if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use the forgot password method',
        400
      )
    );
  }

  // 2) filter because we want to exclude some fields that are not allowed to be updated eg password
  const filteredBody = filteredObj(req.body, 'name', 'email');

  // 3) update user document.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  // we don't delete the accounnt, we just deactivate it, in case the user wants to reactivate it in the future
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use the /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.getSingleUser = factory.getOne(User);

exports.deleteUser = factory.deleteOne(User);

// Do not update users password with this, because with findByIdAndUpdate, all the safe middleware is not run
exports.updateUser = factory.updateOne(User);
