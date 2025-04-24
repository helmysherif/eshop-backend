const subCategoryModel = require("../models/subCategory.model");
const factory = require("./handlersFactory");
// middlewares
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};
exports.createFilterObject = (req, res, next) => {
  let filteredObject = {};
  if (req.params.categoryId) {
    filteredObject = { category: req.params.categoryId };
  }
  req.filteredObj = filteredObject;
  next();
};
// @desc create new subcategory
// @route POST /api/v1/subcategories
// @access private
exports.createSubCategory = factory.createOne(subCategoryModel);
// @desc get all subcategories
// @route GET /api/v1/subcategories
// @access public
exports.getAllSubCategories = factory.getAll(subCategoryModel, "name");
// @desc get specific subCategory by id
// @route GET /api/v1/subcategories/:id
// @access public
exports.getSubCategory = factory.getOne(subCategoryModel);
// @desc update subCategory
// @route PUT /api/v1/subcategories/:id
// @access private
exports.updateSubCategory = factory.updateOne(subCategoryModel);
// @desc delete subcategory
// @route DELETE /api/v1/subcategories/:id
// @access private
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
// @desc get subcategories count
// @route get /api/v1/subcategories/count
// @access private
exports.getSubCategoriesCount = factory.getCount(subCategoryModel);
