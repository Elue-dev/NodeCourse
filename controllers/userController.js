// const fs = require('fs');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
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
