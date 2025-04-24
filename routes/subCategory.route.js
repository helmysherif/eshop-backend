const express = require("express");
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesCount,
  setCategoryIdToBody,
  createFilterObject,
} = require("../controllers/subCategory.controller");
const {
  createSubCategoryValidator,
  getSubCategoryValidators,
  updateSubCategoryValidators,
  deleteSubCategoryValidators,
} = require("../utils/validators/subCategoryValidator");
const authService = require("../controllers/auth.controller");
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObject, getAllSubCategories);
router
  .route("/count")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getSubCategoriesCount
  );
router
  .route("/:id")
  .get(getSubCategoryValidators, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateSubCategoryValidators,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteSubCategoryValidators,
    deleteSubCategory
  );
module.exports = router;
