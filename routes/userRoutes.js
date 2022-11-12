const express = require('express');
const userController = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
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
} = userController;

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);
router.use(restrictTo('admin')); // so all routes below this middleware would need authentication and authorization

router.patch('/update-password', updatePassword); // protect cuz only logged in users can update password and it also puts the user object on the request object

router.get('/me', getMe, getUser); // getMe fakes it that the id is actually coming from the url
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser);

module.exports = router;
