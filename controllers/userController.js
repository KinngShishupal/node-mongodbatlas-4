const User = require("../models/userModel");
const AppError = require("../utils/appError");
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields)=>{
  const newObj = {};
Object.keys(obj).forEach(el=>{
  if(allowedFields.includes(el)){
    newObj[el]=obj[el]
  }
});
return newObj
}

const getAllUsers = factory.getAll(User);

// const getAllUsers = async(req, res) => {
//   try {
//     const users = await User.find()
//     res.status(200).json({
//       status: 'success',
//       results:users.length,
//       data: {
//         users,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };
// we have sign up for this
const createUser = (req, res) => {};

const getUser = factory.getOne(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

const updateMe = async(req, res , next) =>{
try {
  // 1. Create error if user POSTS password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password updates. please use /updateMyPassword',400))
  }

  // 2. filtered out unwanted field names that should noyt be updated
  const filterBody = filterObj(req.body,'name','email'); // we can't use simply req.body down in findByIdAndUpdate as that will updates even roles as well and that we donot want
  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id,filterBody,{new:true, runValidators:true})

  res.status(200).json({
    status: 'success',
    data:{
      user:updatedUser
    }
  });
  
} catch (error) {
  res.status(400).json({
    status: 'fail',
    message: error,
  });
}
}

const deleteMe = async(req, res , next) =>{
  try {
    await User.findByIdAndUpdate(req.user._id,{active:false});
    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
};
