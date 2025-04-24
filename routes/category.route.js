const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesCount,
  uploadCategoryImage,
  resizeImages,
} = require("../controllers/category.controller");
const subCategoryRoutes = require("./subCategory.route");
const {
  getCategoryValidators,
  createCategoryValidator,
  updateCategoryValidators,
  deleteCategoryValidators,
} = require("../utils/validators/categoryValidator");
const authService = require("../controllers/auth.controller");
const router = express.Router();
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImages,
    createCategoryValidator,
    createCategory
  )
  .get(getAllCategories);
router
  .route("/count")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getCategoriesCount
  );
router.use("/:categoryId/subcategories", subCategoryRoutes);
router
  .route("/:id")
  .get(getCategoryValidators, getCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImages,
    updateCategoryValidators,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteCategoryValidators,
    deleteCategory
  );
module.exports = router;
