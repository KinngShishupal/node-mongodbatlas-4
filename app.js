const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const useRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); //for secure http headers
const mongoSanitize = require('express-mongo-sanitize'); // for data sanitization
const  xss = require('xss-clean'); // for data sanitization
const hpp = require('hpp'); // to restrict duplicates in the query string
const path = require('path');

// setting pug template engine
app.set('view engine','pug');
app.set('views',path.join(__dirname, 'views')); // location where our views are located we always provide path relative to the file from which our node application is running
// serving static files
app.use(express.static(path.join(__dirname,'public')));

// Global MIddlewares
// adding helmet
app.use(helmet()) // for setting security http headers, should come in beginning

if (process.env.NODE_ENV === 'development') {
  // to log which api is called and its related things like time status etc
  app.use(morgan('dev'));
}

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many resquets from this IP, Please try again in an hour'
})

// Apply the rate limiting middleware to all requests
app.use('/api',limiter); // applied to all the routes starting with /api this applies to all apis we can set for specifics as well


app.use(express.json({limit:'10kb'})); // middleware to read body data also called body parser, limiting boy data to be max 10kb
// app.use(express.static(`${__dirname}/public`));

// DATA SANITIZATION
 // Data sanitization against noSQL query injection
 app.use(mongoSanitize());

//  Data sanitization against cross site scripting attacks(xss)
app.use(xss());// it converts html into other formats so that hacker can't inject scripts

// Prevent parameter pollution
app.use(hpp({
  whitelist:['duration', 'maxGroupSize', 'price','ratingsQuantity','ratingsAverage','difficulty'] // allowed for duration and maxgroupSize etc  field to have duplicate keys in the query string
}));
// custom middleware
app.use((req, res, next) => {
  // middleware applies to every request whether it is get post put patch delete etc
  console.log('hello from middleware ...');
  // console.log(req.headers)
  next();
});

// Routes
app.get('/',(req, res)=>{
  res.status(200).render('base',{
    tour: 'The Forest Hiker',
    user:'ShiShupal Singh'
  }); // system will look for base file in views folder specified above
});

app.get('/overview',(req, res)=>{
  res.status(200).render('overview',{
    title: 'All Tours'
  }); // system will look for base file in views folder specified above
});

app.get('/tour',(req, res)=>{
  res.status(200).render('tour',{
    title: 'The Forest Hiker'
  }); // system will look for base file in views folder specified above
})


app.use('/api/v1/tours', tourRouter); // this is called mounting of routers
app.use('/api/v1/users', useRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  // 1 way
  // res.status(404).send({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // 2 way of error handling
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // whenever we write anything inside next it automatically calls error handling middleware ny its own

  // 3 way of error handling
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

// error handling middleware
// this is way to handle error at one place
app.use(globalErrorHandler);

// Server
module.exports = app;
