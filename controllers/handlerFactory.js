// here we will write a generic function for delete operation that will work for user, review and tour etc

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

const deleteOne = (Model)=>async(req, res, next)=>{
try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log('🍖🍖🌮🍖🍗🍗🥩',{Model,doc, req:req.params.id})
    if (!doc) {
        return next(new AppError('No Document Found With this id', 404));
      }
      res.status(204).json({
        status: 'success',
        data: {
          doc: doc,
        },
      });
} catch (error) {
    res.status(400).json({
        status: 'fail',
        message: error,
      });
}
}

const updateOne = Model=>async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return next(new AppError('No Doc Found With this id', 404));
      }
      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error,
      });
    }
  };

  const createOne = Model=> async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error,
      });
    }
  };

  const getOne=(Model, populateOptions) => async (req, res, next) => {
    try{

        let query = Model.findById(req.params.id);
        if(populateOptions) query = query.populate(populateOptions);
        const doc = await query;
    //   const doc = await Model.findById(req.params.id).populate(populateOptions); // to populate reviews data in tours
      // Tour.findOne({_id:req.params.id}) same result as above
      if (!doc) {
        return next(new AppError('No Document Found With this id', 404));    
      }
      res.status(200).json({
        status: 'success',
        data: {
          doc,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error,
      });
    }
  };

  const getAll=Model => async (req, res) => {
    try {
      // EXECUTE QUERY
      const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
  
      const doc = await features.query;
  
      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          data:doc,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error,
      });
    }
  };

module.exports = {deleteOne, updateOne, createOne, getOne, getAll};
      

// FOR REFERENCE
// const deleteTour = async (req, res, next) => {
//     try {
//       const tour = await Tour.findByIdAndDelete(req.params.id);
//       if (!tour) {
//         return next(new AppError('No Tour Found With this id', 404));
//       }
//       res.status(204).json({
//         status: 'success',
//         data: {
//           tour: tour,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: 'fail',
//         message: error,
//       });
//     }
//   }; 


// const updateTour = async (req, res, next) => {
//     try {
//       const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//       });
//       if (!tour) {
//         return next(new AppError('No Tour Found With this id', 404));
//       }
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: tour,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: 'fail',
//         message: error,
//       });
//     }
//   };

// const createTour = async (req, res) => {
//     try {
//       const newTour = await Tour.create(req.body);
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: 'fail',
//         message: error,
//       });
//     }
//   };


// const getTour = async (req, res, next) => {
//     try{
//       const tour = await Tour.findById(req.params.id).populate('reviews'); // to populate reviews data in tours
//       // Tour.findOne({_id:req.params.id}) same result as above
//       if (!tour) {
//         return next(new AppError('No Tour Found With this id', 404));    
//       }
//       res.status(200).json({
//         status: 'success',
//         data: {
//           tour,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: 'fail',
//         message: error,
//       });
//     }
//   };



// const getAllTours = async (req, res) => {
//     try {
//       // console.log('xxxxxxxxx', req.query);
//       // EXECUTE QUERY
//       const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
  
//       const tours = await features.query;
  
//       res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//           tours,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: 'fail',
//         message: error,
//       });
//     }
//   };