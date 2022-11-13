const crypto = require('crypto');
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
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
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
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
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

// for the reset password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  //remember we checked if the user has changed its password in the controller, so we minus 1second, because sometimes it happend that the token is created some seconds before the changed password timestamp has bee created, so it would put the passwordChangedaT  1 second in the past and that's not a problem
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//QUERY MIDDLEWARE -  so points to current query (using this to return only users with active of true)
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  //expires after 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //return plain text token that we would send as an email (unencrypted). So we send the user the unencrypted one and we have the encrypted one in our database.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
