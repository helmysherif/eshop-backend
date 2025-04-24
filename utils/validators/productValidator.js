const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CategoryModel = require("../../models/category.model");
const SubCategoryModel = require("../../models/subCategory.model");
const BrandModel = require("../../models/brand.model");
exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("product title must be at least 3 chars")
    .isLength({ max: 100 })
    .withMessage("product title must be not exceed 100 chars")
    .notEmpty()
    .withMessage("product title is required")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("product title is required")
    .isLength({ min: 20 })
    .withMessage("product description must be at least 20 chars")
    .isLength({ max: 2000 })
    .withMessage("product description must be not exceed 2000 chars"),
  check("quantity")
    .notEmpty()
    .withMessage("product quantity is required")
    .isNumeric()
    .withMessage("product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("product sold number must be a number"),
  check("price")
    .notEmpty()
    .withMessage("product price is required")
    .isNumeric()
    .withMessage("product price must be a number")
    .isLength({ max: 32 })
    .withMessage("too long price"),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("product priceAfterDiscount must be a number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors should be an array of strings"),
  check("imageCover").notEmpty().withMessage("product imageCover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("product images should be an array of strings"),
  check("category")
    .notEmpty()
    .withMessage("product category is required")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category)
          return Promise.reject(
            new Error(`no category for this Id: ${categoryId}`)
          );
      })
    ),
  check("subCategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid subCategory ID format")
    .custom((subCategoryIds) =>
      SubCategoryModel.find({
        _id: { $exists: true, $in: subCategoryIds },
      }).then((res) => {
        if (res.length < 1 || res.length !== subCategoryIds.length) {
          return Promise.reject(
            new Error(`no subCategories for these Ids: ${subCategoryIds}`)
          );
        }
      })
    )
    .custom((subCategoryIds, { req }) =>
      SubCategoryModel.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCategoryIdsInDB = [];
          subCategories.forEach((subCategory) => {
            subCategoryIdsInDB.push(subCategory._id.toString());
          });
          const checker = subCategoryIds.every((v) =>
            subCategoryIdsInDB.includes(v)
          );
          if (!checker) {
            return Promise.reject(
              new Error(`these subcategories are not belong to this category`)
            );
          }
        }
      )
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .custom((brandId) =>
      BrandModel.findById(brandId).then((brand) => {
        if (!brand)
          return Promise.reject(new Error(`no brand for this Id: ${brandId}`));
      })
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("ratingsAverage must be greater than or equal 1")
    .isLength({ max: 5 })
    .withMessage("ratingsAverage must be less than or equal 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];
exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  validatorMiddleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("product title must be at least 3 chars")
    .isLength({ max: 100 })
    .withMessage("product title must be not exceed 100 chars")
    .notEmpty()
    .withMessage("product title is required"),
  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("product description must be at least 20 chars"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("product price must be a number")
    .isLength({ max: 32 })
    .withMessage("too long price"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number"),
  body("title")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];
exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  validatorMiddleware,
];
