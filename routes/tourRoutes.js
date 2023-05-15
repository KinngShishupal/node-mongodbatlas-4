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
const router = express.Router();

// param middleware that runs when certain parameter is there in route
// here it is used to validate the received id paramater
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats); // aggregation pipeline
router.route('/monthly-plan/:year').get(getMonthlyPlan); // aggregation pipeline advanced

router.route('/').get(protect, getAllTours).post(createTour); //protect is actually is middleware whose job is to check if user have access to particular route
router.route('/:id').get(getTour).patch(updateTour).delete(protect,restrictTo('admin','lead-guide'),deleteTour);

module.exports = router;
