const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide an email'],
      lowercase: true, //not a validator, just transforms email to lower case
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Password is a required field'],
      minLength: 8,
      select: false, // never show password in any output
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (value) {
          // only works on SAVE or CREATE
          return value === this.password; // can be true or false
        },
        message: `Passwords do not match`,
      },
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ENCRYPT USER PASSWORD
userSchema.pre('save', async function (next) {
  // check if user has not modified their password and return from the function
  if (!this.isModified('password')) return next();

  //run this (hash password) if user modified their password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // delete confirm password
  this.passwordConfirm = undefined;
  next();
});

// INSTANCE METHOD - method that will be available on all documents of a certain collection (in this case user document, so we will even use this in our auth controller)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password wont be available cuz of select: false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
