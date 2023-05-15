const util = require('util'); // inbuild
const User = require('../models/userModel');
var jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 
const sendEmail = require('./email');

const signup = async (req, res, next) => {
  try {
    // const newUSer = await User.create(req.body);
    // the below methodology allows us to take only required fields
    const newUSer = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
      passwordResetToken: req.body.passwordResetToken,
      passwordResetExpires: req.body.passwordResetExpires,
    });

    // const token = jwt.sign(object for all the data we want to store insidetoken, secret String, options)
    const token = jwt.sign({ id: newUSer._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // send cookie along with response
    const cookieOptions = {
      expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000), // converted time to ms
      // secure:true, // cookie will be sent to https connection i.e secure connection only
      httpOnly:true,// brower just stores and send it back along with every request automatically
    }

    if(process.env.NODE_ENV === 'production'){
      cookieOptions.secure = true
    }
    res.cookie('jwt',token,cookieOptions)

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUSer,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. check if email and pass exits

    if (!email || !password) {
      const err = new AppError('Please provide email and password', 400);
      return next(err);
    }

    // 2. check if user exits and pass is correct
    const user = await User.findOne({ email: email }).select('+password'); // +password basically helps us to get fields for which select is set as false in schema as we need password here

    const correct = user
      ? await user.correctPassword(password, user.password)
      : false; // correctPassword is available as instance methods are available evrywhere that document is called, here we have called the document in user variable
    if (!user || !correct) {
      return next(new AppError('Incorrect email or password', 401));
    }
    // 3. if everything is ok , senf token to client
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

// For protected routes
const protect = async (req, res, next) => {
  try {
    // 1. getting token and check if its there
    // console.log('token>>>>>>>>>>', req.headers);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // console.log('token++++++++++++', token);
    if (!token) {
      return next(
        new AppError(
          'You are not not logged in to get access, kindly log in',
          401
        )
      );
    }

    // 2. verification token
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    ); // promisify coverts something into promise, we could convert it into promise as third argument is a callback function

    // console.log('<><><>><>><',decoded); // this decoded data contains user id ans exp and creation date
    // 3. check if user still exists(like user was deleted or changed password after he was logged in)
    const userBasedOndecodedId = await User.findById(decoded.id); // userBasedOndecodedId is basically current user
    if (!userBasedOndecodedId) {
      return next(
        new AppError('The User belonging to this token No Longer exists', 401)
      );
    }
    // 4. check if user changes passwords after jwt was issued
    if (userBasedOndecodedId.changedPasswordsAfter(decoded.iat)) {
      return next(
        new AppError(
          'User Changed his password recently, Please log in again',
          401
        )
      );
    }

    //  grant access to protected route
    req.user = userBasedOndecodedId; // this stores current logged user into the user variable in the request which can be used in the next function if necessary
    next();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

// For Authorization
const restrictTo = (...roles) => {
  // spread operator converts incoming roles into an array, this function is also an example of closures
  return (req, res, next) => {
    // console.log('roles >>>>>>',roles, req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action', 403)
      );
    }
    next();
  };
};

const forgotPassword = async (req, res, next) => {
   // 1. Get user based on posted email
   const user = await User.findOne({ email: req.body.email });
  try {
   
    // console.log('wwwwwwwww', { user });
    if (!user) {
      return next(
        new AppError('There is no user with this email address', 404)
      );
    }
    // 2. Generate the random reset token

    const resetToken = user.createPasswordResetToken();
    // console.log('wwwwwwwww', { user, resetToken });
    await user.save({ validateBeforeSave: false }); // to save the modified data which includes passwordResetExpires and passwordResetToken
    // validateBeforeSave:false as we will be proving only the email and wants token to be saved into the databse

    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;
    const message = `Forgot your password? Submit a patch request with your new password and password conform to: ${resetURL}.\n if
    you did'nt forgot your password, please ignore this email`;

    await sendEmail({
      email:user.email,
      subject:'Your Password Reset Token (Valid for 10 minutes)',
      message
    })

    res.status(200).json({
      status: 'success',
      message: 'Token Sent to email successfully'
    });

  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires= undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Please try again', 500))
  }
};
const resetPassword = async(req, res, next) => {
try {
  // 1. Get User based on token
        // keep in mind that token sent in the url is not encyptedm but the one stored in database is
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({passwordResetToken: hashedToken,passwordResetExpires:{$gt:Date.now()}}); //this will check if password has expired or not
  // 2. If Token has not expired, and there is user, set the new password
  if(!user){
    return next(new AppError('Token is invalid or has expired',400))
  }
  console.log('reset password parameters',{user})
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires  =undefined;

  await user.save();
  // 3. update changePasswordAt property for the user
  //  this is done through model middleware

  // 4. Log in the user, send JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token
  });
  
  
} catch (error) {
  res.status(400).json({
    status: 'fail',
    message: error,
  });
}
};

const updatePassword = async(req, res, next) => {
  // to update password for logged in user without having to forget and reset it
  try {
    // 1. Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    console.log('user is >>>>',{user, data:req.user})
    // 2. Check if Posted password is correct

    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
return  next(new AppError('Your Current Password is wrong',401))
    }

    // 3. update the password if it is correct
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4. Log user again i.e send JWT 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
};
