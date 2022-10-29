// const fs = require('fs');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((val) => {
    if (allowedFields.includes(val)) {
      newObj[val] = obj[val];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user tries to update password or if user posts  password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use the forgot password method',
        400
      )
    );
  }

  // 2) filter because we want to exclude some fields that are not allowed to be updated
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

exports.getSingleUser = (req, res) => {
  // const userID = req.params.id;
  // const singleUser = users.find((user) => user._id === userID);
  // if (!singleUser)
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: `Route not yet defined`,
  //   });
  // res.status(200).json({
  //   status: 'success',
  //   data: { singleUser },
  // });
};

exports.createUser = (req, res) => {};
exports.updateUser = (req, res) => {};
exports.deleteUser = (req, res) => {};
