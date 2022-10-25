const express = require('express');
const userController = require('../controllers/userController');

const { signup, login } = require('../controllers/authController');

const { getAllUsers, createUser, getSingleUser, updateUser, deleteUser } =
  userController;

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(protect, getAllUsers).post(createUser);

router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser);

module.exports = router;
