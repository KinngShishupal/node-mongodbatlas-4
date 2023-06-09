const mongoose = require('mongoose');
const slugify = require('slugify');
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
    slug:String,
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
        message: 'Difficulty can be easy, medium, or difficult',
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
    startLocation: {
      // geoSpatial Data / GeoJSON
      type: {
        type: String,
        default: 'Point', // polygons, lines, point etc
        enum: ['Point']
      },
      coordinates: [Number], // array of numbers
      address:String,
      description:String
    },
    locations:[
      {
        type:{
          type:String,
          default: 'Point', 
        enum: ['Point'],
        coordinates: [Number], // array of numbers
      address:String,
      description:String,
      day:Number
        }
      }
    ],
    // guides:Array, // here we will put all the guides ids who are engaged with this tour embedding example
    guides:[ 
      {
        type: mongoose.Schema.ObjectId,
        ref:'User', // User collection is the reference here
      }
    ]
  },
  {
    toJSON: { virtuals: true }, // these are schema options
    toObject: { virtuals: true },
  }
);

// defining virtual properties, i.e those properties which are derived from one another
// they are implemented only when we get data from data base
tourSchema.virtual('durationWeeks').get(function () {
  // this durationWeeks fields will only be reflected in the resposne but not in DB
  return this.duration / 7;
});


// to provide virtual populate for reviews so that tour also knows about their reviews;
tourSchema.virtual('reviews',{
  ref:'Review', // name the model that we want to reference
  foreignField: 'tour', // name of the field in this Review model to which reference to current model i.e tour modal is stored 
  localField: '_id', // name of the field in this tour model that stores the value in the foreign field
  // justOne: true
});

// DOCUMENT MIDDLEWARE
// runs before .save() and .create()
// next is required only if we have more than one document middleware
// this below refers to currently processed document
// tourSchema.pre('save', function (next) {
//   this.name = this.name.toUpperCase(); // this simple converts the name to uppercase
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name,{lower:true})
  next()
});

// connecting user document into tour document by Embedding
// tourSchema.pre('save',  async function (next) {
//    const guidesPromises = this.guides.map(async id=>await User.findById(id)); // this is an array full of promises
//    this.guides = await Promise.all(guidesPromises);
//   next();
// });

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
  // since it is a query middleware this always points to current query
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  // populate is for polulating data for referneces fields here guides
  // since it is a query middleware this always points to current query
  this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt', // these two fields will not appear in the output
  });
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