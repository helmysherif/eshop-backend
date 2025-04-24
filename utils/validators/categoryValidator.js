const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
exports.getCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid Categort ID Format"),
  validatorMiddleware,
];
exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3 })
    .withMessage("Category name is too short")
    .isLength({ max: 40 })
    .withMessage("Category name is too long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("image").notEmpty().withMessage("Category image is required"),
  validatorMiddleware,
];
exports.updateCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid Categort ID Format"),
  check("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];
exports.deleteCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid Categort ID Format"),
  validatorMiddleware,
];
