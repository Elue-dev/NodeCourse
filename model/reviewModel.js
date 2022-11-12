const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please leave your review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please leave a rating'],
    },
    tour: {
      //parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });  WE REMOVED THE TOUR POPULATE BECAUSE IT IS NOT NECESSARY AS WE ARE USING VIRTUAL POPULATE IN THE TOUR MODEL TO POPULATE THE REVIEWS IN THE TOUR DOCUMENT, BUT IT ALL DEPENDS ON YOUR TYPE OF APPLICATION, BUT THE ID WOULD STILL BE THERE, BUT NOT POPULATED (parent referencing)

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

//important note on the above, the tours have no idea of these reviews, so the other way around. This happens because we did parent referencing on the reviews, so how do we solve this?

// 1) Query the reviews each time we query for tours.
// 2) Also do child referencing on the tours, basically keep an array of all the review ids on each tour document, then all we would have to do is populate that array. but we dont want to do this which can cause documents to end up being very large, and thats why we picked parent referencing in thre first place

// Mongoose offers us a very good solution for this with an advanced feature called VIRTUAL POPULATE, with this we can populate tours with reviews, in other words we can get access to all the reviews for a certain tour, but without keeping this array of ids on the tour document, so just like keeping track of the ids but not persisting it in the database

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // 1) get reviews that belong to current tour that was passed in as the argument
  // 2) calculate statistics themselves
  const ratingStats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, //so if there are 5 review document for the current tour, then the for each of these docs, 1 will be added, so in the end, the number of ratings would be 5
        avgRating: { $avg: '$rating' }, // calculate the average from the rating field.
      },
    },
  ]);

  if (ratingStats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: ratingStats[0].nRating,
      ratingsAverage: ratingStats[0].avgRating.toFixed(1), //a setter can be used for this rounding...(line 41 in tour model)
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // we can't use Review.calcAverageRatings(this.tour), because we dont have access to the 'Review' at this point. this.constructor still refers to the model, the model who created that document
  this.constructor.calcAverageRatings(this.tour);

  // NB - post middleware does not get access to next
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // remember that behind the scenes, findByIdAndUpdate and findByIdDelete are just shorthands for find one and update with the current id, thats why we used /^findOneAnd/ above. (we need to use findOneAndUpdate and findOneAndDelete)

  // const review = await this.findOne(); we changed it to the below so that the post middleware can have acess to the tour id, and remember, the id is stored in the 'tour' field
  this.review = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); - does not work here because the query has already been executed
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
