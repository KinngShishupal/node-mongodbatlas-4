const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJwtError = (err)=>{
  return new AppError('Invalid Token. Please login again',401)
}

const handleJwtExpiredError =(err)=>{
  return new AppError('Token Expired. Please login again',401)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational. trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error dont leake message details to client

    // Log Error
    console.error('Error >>>>>>', err);

    // Send Message to CLient
    res.status(500).json({
      status: 'error',
      message: 'Something Went Wrong ...',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Something Went Wrong ...';

  if (process.env.NODE_ENV === 'development') {
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    //   error: err,
    //   stack: err.stack,
    // });
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    // });

    let error = { ...err };

    if (error.name === 'CastError') {
      // this is just done to modify the default error we are getting in case of cast error
      // cast error are found when we write invalid id in search by id and at other places also
      error = handleCastErrorDB(error);
    }
    if(err.name === 'JsonWebTokenError'){
      error = handleJwtError(error)
    }
    if(err.name === 'TokenExpiredError'){
      error = handleJwtExpiredError(error)
    }
    sendErrorProd(error, res);
  }

  next();
};
