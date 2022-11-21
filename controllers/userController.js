const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// IF YOU DON'T NEED IMAGE PROCESSING, DO IT THIS WAYT
// const multerStorage = multer.diskStorage({
//   //cb is a callback function, is like next in express, its similar in that we can pass errors and other stuffs
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //null = no error
//   },
//   filename: (req, file, cb) => {
//     // user - random string - current timestamp
//     // user-6457bgd64gyd-7436728765.jpg -- like this we can guarantee that there won't be two images with the same file name
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${Math.round(Math.random() * 1e9)}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage(); //this way the image would be saved as a buffer, it is then available at req.file.buffer

// goal here is to test if the uploaded file is an image, if it so, we pass true to the callback function, if it is not, we pass false to the callback function along with an error. All these we are doing works not just for files, but also ay type of file you want to upload
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// images are not directly uploaded to the database, we just upload them into our file system and then in the database we put a link basically  to that image
exports.uploadUserPhoto = upload.single('photo');

// at this point we already have a file in our request, at least if there was an upload, and if there was no upload, we don't want to do anything
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Math.round(
    Math.random() * 1e9
  )}-${Date.now()}.jpeg`; //we are doing it like this because, right now, this filename is not defined, so we savd the image to memory as a buffer, the filename would not really get set, but we really need the filename in our other middleware function

  // when doing image processing like this right after uploading a file, it's always best to not even save the file to the disk, but instead, save it to memorty. More efficient like this, instead of having to write the file to the disk and then here read it again, we basically keep the image here in memory and then here we can read that.
  sharp(req.file.buffer)
    .resize(500, 500) //resize to square
    .toFormat('jpeg') //covert to jpeg
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

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

  // 2) filter because we want to exclude some fields that are not allowed to be updated eg changing user role to admin, with this, only name and email can be changed
  const filteredBody = filteredObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; //add photo property to the object that would be updated

  // 3) update user document.
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

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
