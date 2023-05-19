const Review = require("../models/reviewModel")

const createReview = async(req, res) => {
    try {
        const newReview = await Review.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                newReview,
            },
          });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error,
        });
    }
}

const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find();
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error,
        });
    }
}

module.exports = {
    createReview, getAllReviews
}
