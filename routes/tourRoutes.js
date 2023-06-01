const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes'); 
const router = express.Router();

// param middleware that runs when certain parameter is there in route
// here it is used to validate the received id paramater
// router.param('id', checkID);

// use reviewRouter if :tourId/reviews this comes this is also called mounting of router like app.use
// to have reviewRouter get access to params here tourId we will use mergeParams in reviewRouter
router.use('/:tourId/reviews',reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats); // aggregation pipeline
router.route('/monthly-plan/:year').get(protect,restrictTo('admin','lead-guide','guide'),getMonthlyPlan); // aggregation pipeline advanced

router.route('/').get(getAllTours).post(protect,restrictTo('admin','lead-guide'),createTour); //protect is actually is middleware whose job is to check if user have access to particular route
router.route('/:id').get(getTour).patch(protect,restrictTo('admin','lead-guide'),updateTour).delete(protect,restrictTo('admin','lead-guide'),deleteTour);

// Nested Routes
// creating a review for particular tour id although this fulfilles our requirement but we need a more advanced way to handle this
// we will not call reiview controller her instead we will make use of review router here with then  help of middleware as shown above as middle always comes first
// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview); 

module.exports = router;
