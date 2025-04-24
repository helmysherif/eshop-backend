const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
exports.getBrandValidators = [
  check("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];
exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name is too short")
    .isLength({ max: 40 })
    .withMessage("Brand name is too long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];
exports.updateBrandValidators = [
  check("id").isMongoId().withMessage("Invalid Brand ID Format"),
  check("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];
exports.deleteBrandValidators = [
  check("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];
