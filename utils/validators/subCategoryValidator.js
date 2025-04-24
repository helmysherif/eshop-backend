const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CategoryModel = require("../../models/category.model");
exports.getSubCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  validatorMiddleware,
];
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subCategory name is required")
    .isLength({ min: 2 })
    .withMessage("subCategory name is too short")
    .isLength({ max: 32 })
    .withMessage("subCategory name is too long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("subCategory must belong to a specific category")
    .isMongoId()
    .withMessage("Invalid category ID Format")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category)
          return Promise.reject(
            new Error(`no category for this Id: ${categoryId}`)
          );
      })
    ),
  validatorMiddleware,
];
exports.updateSubCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];
exports.deleteSubCategoryValidators = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID Format"),
  validatorMiddleware,
];
