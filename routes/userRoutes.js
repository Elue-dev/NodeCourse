const express = require('express');
const userController = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} = require('../controllers/authController');

const {
  getAllUsers,
  getUser,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = userController;

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/updateMe/:id', uploadUserPhoto, resizeUserPhoto, updateMe); // photo is the field that will hold the image file to be uploaded, i.e the field in the form that is going to be uploading the image.

router.use(protect); // so all routes below this middleware would need authentication and authorization

router.patch('/update-password', updatePassword); // protect cuz only logged in users can update password and it also puts the user object on the request object

router.get('/me', getMe, getUser); // getMe fakes it that the id is actually coming from the url
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(restrictTo('admin'), getSingleUser)
  .patch(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

module.exports = router;
