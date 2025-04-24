const ReviewModel = require("../models/review.model");
const factory = require("./handlersFactory");
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// Nested routes for reviews
// POST /products/:productId/reviews
exports.createProductFilterObject = (req, res, next) => {
  let filteredObject = {};
  if (req.params.productId) {
    filteredObject = { product: req.params.productId };
  }
  req.filteredObj = filteredObject;
  next();
};
// @desc create new review
// @route POST /api/v1/reviews
// @access private/protect/User
exports.createReview = factory.createOne(ReviewModel);
// @desc get all reviews
// @route GET /api/v1/reviews
// @access public
exports.getAllReviews = factory.getAll(ReviewModel, "name");
// @desc get specific review by id
// @route GET /api/v1/reviews/:id
// @access public
exports.getReview = factory.getOne(ReviewModel);
// @desc update review
// @route PUT /api/v1/reviews/:id
// @access private
exports.updateReview = factory.updateOne(ReviewModel);
// @desc delete review
// @route DELETE /api/v1/reviews/:id
// @access private/protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(ReviewModel);
