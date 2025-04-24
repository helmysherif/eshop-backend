const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CouponModel = require("../../models/coupon.model");
exports.addCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("coupon name is required")
    .isString()
    .withMessage("coupon name must be a string")
    .isLength({ min: 3 })
    .withMessage("coupon name must be at least 3 characters long")
    .custom((val) =>
      CouponModel.findOne({ name: val }).then((coupon) => {
        if (coupon) {
          return Promise.reject(new Error("coupon name must be unique"));
        }
      })
    ),
  check("expire")
    .notEmpty()
    .withMessage("coupon expire date is required")
    .isDate()
    .withMessage("coupon expire date must be a valid date"),
  check("discount")
    .notEmpty()
    .withMessage("coupon discount is required")
    .isNumeric()
    .withMessage("coupon discount must be a number"),
  validatorMiddleware,
];
