// here we will write a generic function for delete operation that will work for user, review and tour etc

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

module.exports = {deleteOne, updateOne};
      

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