const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have 40 characters or less'],
      minLength: [10, 'A tour name must have at least 10 characters or more'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // enum - values allowed
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be one of the following: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must have a rating of at least 1'],
      max: [5, 'A tour cannot have a rating of more than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price; // can be true or false
        },
        message: `Price discount ({VALUE}) must be less than the initial price`,
      },
    },
    summary: {
      type: String,
      trim: true, // trim only works for strings, removes white spaces at beginning and end
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //array of strings
    startDates: [Date],
    secretTour: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUAL PROPERTIES - fields we can define in our schema, but will not be persisted i.e will not be saved into the database in order to save us some space there. it makes sense for fields that can be derived from one another, e.g conversion from miles to kilometers, it dosen't make sense to store these two fields in the database, if we can easily convert one to the other. NOTE: we can't use virtuals in a query, because they are technically not part of the database

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // calculates duration in weeks
}); //get - getter. because this virtual property would basically be created each time we get the data out of the database

// DOCUMENT MIDDLEWARE: runs before a doc is saved in the database (i.e before .save() command and .create() command, but not on insertMany or findById etc )
tourSchema.pre('save', function (next) {
  // this - points to currently processed document (i.e doc being saved).
  this.slug = slugify(this.name, { lower: true });
  next();
});

//you can have multiple pre middlewares (or post middlewares)
//NB - it may also be called hooks in place of middlewares
// tourSchema.pre('save', (next) => {
//   console.log('will save doc');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   // doc - doumnety that was just saved
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE: allows us to run functions before and after a certain query is executed
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  //reg exp here means, starts with 'find', we did this because we want this middle ware to work for both 'find' and 'findOne
  //here, this keyword points to the present query and not the present document
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
//we want to also exclude secret tours for aggregations too
tourSchema.pre('aggregate', function (next) {
  // add another matgch stage at the beginning of thew aggregate
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//to hide something from showing, add select: false

// 4 TYPES OF MIDDLEWARES IN MONGOOSE:
// - Document middleware (Acts on currently processed document)
// - Query middleware
// - Aggregate middleware
// - Model middleware
