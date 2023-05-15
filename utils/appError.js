class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // to indicate this is operational error

    Error.captureStackTrace(this, this.constructor); // this line captures the stack of where the error actually took place
  }
}

module.exports = AppError;
