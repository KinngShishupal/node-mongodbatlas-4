const express = require('express');
const { createReview, getAllReviews, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController');
const { restrictTo, protect } = require('../controllers/authController');
// by default each router has only access to their routes not others so meregePrams come into picture at this point
const router = express.Router({ mergeParams:true}); // mergeParams provides access to parameters if it had been rerouter from some where else see tourRoutes for explanation

router.use(protect);
router.route('/').get(getAllReviews).post(restrictTo('user'),setTourUserIds,  createReview);
router.route('/:id').delete(restrictTo('user','admin'),deleteReview).patch(restrictTo('user','admin'),updateReview).get(getReview);

module.exports = router;