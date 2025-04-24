const express = require("express");
const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  createProductFilterObject,
  setProductIdAndUserIdToBody,
} = require("../controllers/review.controller");
const authService = require("../controllers/auth.controller");
const {
  createReviewValidator,
  updateReviewValidators,
  deleteReviewValidators,
} = require("../utils/validators/reviewValidator");
// POST /products/:productId/reviews
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  )
  .get(createProductFilterObject, getAllReviews);
router
  .route("/:id")
  .get(getReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidators,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "manager", "admin"),
    deleteReviewValidators,
    deleteReview
  );
module.exports = router;
