const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const CategoryModel = require("../models/category.model");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
exports.uploadCategoryImage = uploadSingleImage("image");
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);
    req.body.image = filename;
  }
  next();
});
// @desc create new category
// @route POST /api/v1/categories
// @access private
exports.createCategory = factory.createOne(CategoryModel);
// @desc get all categories
// @route GET /api/v1/categories
// @access public
exports.getAllCategories = factory.getAll(CategoryModel, "name");
// @desc get specific category by id
// @route GET /api/v1/categories/:id
// @access public
exports.getCategory = factory.getOne(CategoryModel);
// @desc update category
// @route PUT /api/v1/categories/:id
// @access private
exports.updateCategory = factory.updateOne(CategoryModel);
// @desc delete category
// @route DELETE /api/v1/categories/:id
// @access private
exports.deleteCategory = factory.deleteOne(CategoryModel);
// @desc get categories count
// @route get /api/v1/categories/count
// @access private
exports.getCategoriesCount = factory.getCount(CategoryModel);
