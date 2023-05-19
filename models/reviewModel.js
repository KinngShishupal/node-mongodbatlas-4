const mongoose = require('mongoose');
// Below is also an example of parent referencing as well 
// we opt for parent referencing when we dont know how much our array will grow
// ref to tour and ref to user
// Basically every review knows to which tour and user they belong to, but user and tour have no idea about their reviews

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Please provide a review']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, {
    toJSON: { virtuals: true }, // these are schema options
    toObject: { virtuals: true },
});

reviewSchema.pre(/^find/, function (next) {
    // populate is for polulating data for referneces fields here guides
    // since it is a query middleware this always points to current query
    this.populate({
      path:'tour',
      select:'name', // we want only tour name
    }).populate({
        path:'user',
        select:'name photo', // these two fields will not appear in the output
      });
    next();
  });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;