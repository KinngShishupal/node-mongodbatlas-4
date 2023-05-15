const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour MUst have a Name ...'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name Should be less than 40'],
      minlength: [5, 'Name Should be more than 5'],
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'Tour Must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour Must have a groupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be easy, medium, hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1, 'Rating Must be above 1'],
      max: [5, 'Rating Must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // this points to current doc
          return value < this.price;
        },
        message: 'Price Should be greater than price discount ({VALUE})', // VALUE is same as value in function
      },
    },
    summary: {
      type: String,
      trim: true, // it works for string only
      required: true,
    },
    description: {
      type: String,
      trim: true, // it works for string only
    },
    imageCover: {
      type: String,
      required: [true, 'Image is required'],
    },
    images: [String], // array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],

    secretTour: {
      // this is added to understand query middlewares
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // these are schema options
    toObject: { virtuals: true },
  }
);

// defining virtual properties, i.e those properties which are derived from one another
// they are implemented only when we get data from data base
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// runs before .save() and .create()
// next is required only if we have more than one document middleware
// this below refers to currently processed document
tourSchema.pre('save', function (next) {
  this.name = this.name.toUpperCase(); // this simple converts the name to uppercase
  next();
});

// runs after .save() and .create()
// doc here is currently processed data
// tourSchema.post('save', function (doc, next) {
//   this.name = this.name.toUpperCase(); // this simple converts the name to uppercase
//   next();
// });

// QUERY MIDDLEWARE
// this middleware runs before or after certain query
// this here refers to query
// tourSchema.pre('find', function (next) {
//   // we dont want to send secret tour to client
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// tourSchema.pre('findOne', function (next) {
//   // we dont want to send secret tour to client
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// above two can be replaced with regular expression
// all the commands that starts with find(find, findById, findOne etc) will not include secret tour
tourSchema.pre(/^find/, function (next) {
  // we dont want to send secret tour to client
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// this here refers to current aggregation object
tourSchema.pre('aggregate', function (next) {
  // we dont want to send secret tour to client in case of aggregated queries as well
  // this line simply adds one more match in the begenning of aggregated queries
  // try console this.pipeline() for better view
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
