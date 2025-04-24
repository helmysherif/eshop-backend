const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ReviewModel = require("../../models/review.model");
// const UserModel = require("../../models/user.model");
exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Review ratings are required")
    .isNumeric()
    .withMessage("Review ratings must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review ratings must be between 1 and 5"),
  check("user")
    .notEmpty()
    .withMessage("Review must belong to specific user")
    .isMongoId()
    .withMessage("Invalid User ID Format"),
  check("product")
    .notEmpty()
    .withMessage("Review must belong to specific product")
    .isMongoId()
    .withMessage("Invalid Product ID Format")
    .custom((val, { req }) =>
      // check if logged user create review before
      ReviewModel.findOne({
        user: req.body.user,
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(
            new Error("You already created review for this product")
          );
        }
      })
    ),
  validatorMiddleware,
];
exports.updateReviewValidators = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) =>
      // check review ownership before update
      ReviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`No review found with this ID: ${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to update this review")
          );
        }
      })
    ),
  check("title").optional(),
  validatorMiddleware,
];
exports.deleteReviewValidators = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) => {
      // check review ownership before update
      if (req.user.role === "user") {
        return ReviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`No review found with this ID: ${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not allowed to delete this review")
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
