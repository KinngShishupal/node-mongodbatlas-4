const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');
const { createReview } = require('../controllers/reviewController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect); // this protect will apply to all below routes, we could have also applied them individually as well to each route but this is a better approach
// like router.patch('/updateMyPassword',protect, updatePassword);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', updateMe); // to allow user to his user data except password
router.delete('/deleteMe', deleteMe); // to allow user to his user data except password
router.get('/me',getMe,getUser)

router.use(restrictTo('admin')); //below routes also require admin role along whith protect
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);


module.exports = router;

