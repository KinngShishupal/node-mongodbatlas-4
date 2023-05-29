/*
Without Class
*/

// const Tour = require('../models/TourModel');

// const aliasTopTours = async (req, res, next) => {
//   // here well modify query for best five budget tours
//   try {
//     req.query.limit = '5';
//     req.query.sort = '-ratingsAverage,price';
//     req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//     next();
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// const getAllTours = async (req, res) => {
//   try {
//     console.log('xxxxxxxxx', req.query);
//     // FILTERING
//     const queryObj = { ...req.query };
//     const excludedFields = ['sort', 'limit', 'page', 'fields']; // as these things are handled in separate ways in mongoose
//     excludedFields.forEach((el) => delete queryObj[el]);
//     console.log('rrrrrrr', queryObj);

//     // ADVANCED FILTERING
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     let query = Tour.find(JSON.parse(queryStr));

//     // { difficulty: { $gte: '4' } } this kind required for advanced filtering
//     // { difficulty: { gte: '4' } } received this need to add $

//     // SORTING
//     if (req.query.sort) {
//       // mongdb sort sort('a b c');
//       const sortBY = req.query.sort.split(',').join(' '); // this removes comma from api sort with empty space
//       query = query.sort(sortBY);
//     } else {
//       query = query.sort('-createdAt'); // default sort based on creation date
//     }

//     // FIELD LIMITING
//     if (req.query.fields) {
//       const selectedFields = req.query.fields.split(',').join(' ');
//       query = query.select(selectedFields);
//     } else {
//       query = query.select('-__v');
//     }

//     // PAGINATION

//     // page=2&limit=3

//     const page = req.query.page * 1 || 1; // converting string into number and also default page as 1;
//     const limit = req.query.limit * 1 || 100;
//     const skipValue = (page - 1) * limit;
//     query = query.skip(skipValue).limit(limit);
//     if (req.query.page) {
//       const numTours = await Tour.countDocuments();
//       if (skipValue >= numTours)
//         throw new Error('This Page Doesnot Exists ...');
//     }

//     const tours = await query;
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// const getTour = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     // Tour.findOne({_id:req.params.id}) same result as above
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// const createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// const updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };
// const deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// module.exports = {
//   getAllTours,
//   getTour,
//   createTour,
//   updateTour,
//   deleteTour,
//   aliasTopTours,
// };

/*
With Class
*/

const Tour = require('../models/TourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')

const aliasTopTours = async (req, res, next) => {
  // here well modify query for best five budget tours
  try {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const getAllTours = async (req, res) => {
  try {
    // console.log('xxxxxxxxx', req.query);
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const getTour = async (req, res, next) => {
  try{
    const tour = await Tour.findById(req.params.id).populate('reviews'); // to populate reviews data in tours
    // Tour.findOne({_id:req.params.id}) same result as above
    if (!tour) {
      return next(new AppError('No Tour Found With this id', 404));    
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return next(new AppError('No Tour Found With this id', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const deleteTour = factory.deleteOne(Tour); // this here is complete replacement for below code
// const deleteTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return next(new AppError('No Tour Found With this id', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

const getTourStats = async (req, res) => {
  // Aggregation pipeline
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }, // finds tours with ratings average greater tha equal to 4.5
      },
      {
        $group: {
          // _id: '$difficulty', group by any field
          // _id: {$toUpper: '$difficulty'}, group by any field with id in upper case
          _id: null, // here comes the fields name with which want to group, it comes with a dollar sign
          numTours: { $sum: 1 }, // calculates the sum of Tours adds one for each document
          numRatings: { $sum: '$ratingsQuantity' }, // calculates the sum of ratings
          avgRatings: { $avg: '$ratingsAverage' }, // calculates the average of ratings
          avgPrice: { $avg: '$price' }, // calculates the average of price
          minPrice: { $min: '$price' }, // calculates the minimum price
          maxPrice: { $max: '$price' }, // calculates the maximum price
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 ascending, -1 descending
      },

      // {
      //   $match: {_id: {$ne: 'EASY'}} just to show that we can repeat stages this matching here will apply to its upper stage
      // }
    ]);

    // output comes like
    //   {
    //     "_id": null,
    //     "numTours": 8,
    //     "numRatings": 279,
    //     "avgRatings": 4.699999999999999,
    //     "avgPrice": 1274.7777777777778,
    //     "minPrice": 397,
    //     "maxPrice": 2997
    // }

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  // aggregation pipeline unwinding and projecting
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      // this gives all the plans that starts and ends in the required year
      {
        $unwind: '$startDates', // unwind basically opens up the array
      },

      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, // name of all tours that lies in that particular month
        },
      },
      {
        $addFields: { month: '$_id' }, // adds another field with the name month with same value as id
      },
      {
        $project: {
          _id: 0, // 0 means remove 1 means keep or add, this basically removes _id field from reponse
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },

      // {
      //   $limit: 2, to get desired number of ouputs only
      // },
    ]);
    res.status(200).json({
      status: 'success',
      length: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
