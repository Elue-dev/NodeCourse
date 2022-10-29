const express = require('express');
const userController = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { getAllUsers, createUser, getSingleUser, updateUser, deleteUser } =
  userController;

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.route('/').get(protect, getAllUsers).post(createUser);

router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser);

module.exports = router;
