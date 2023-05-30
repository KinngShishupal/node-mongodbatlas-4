const express = require('express');
const { createReview, getAllReviews, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController');
const { restrictTo, protect } = require('../controllers/authController');
// by default each router has only access to their routes not others so meregePrams come into picture at this point
const router = express.Router({ mergeParams:true}); // mergeParams provides access to parameters if it had been rerouter from some where else see tourRoutes for explanation

router.route('/').get(getAllReviews).post(protect,restrictTo('user'),setTourUserIds,  createReview);
router.route('/:id').delete(deleteReview).patch(updateReview).get(getReview);

module.exports = router;