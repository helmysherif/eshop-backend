const express = require("express");
const {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  getBrandsCount,
  uploadBrandImage,
  resizeImages,
} = require("../controllers/brand.controller");
const authService = require("../controllers/auth.controller");
// const subCategoryRoutes = require("./subCategory.route");
const {
  getBrandValidators,
  createBrandValidator,
  updateBrandValidators,
  deleteBrandValidators,
} = require("../utils/validators/brandValidator");
const router = express.Router();
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImages,
    createBrandValidator,
    createBrand
  )
  .get(getAllBrands);
router
  .route("/count")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getBrandsCount
  );
// router.use("/:categoryId/subcategories", subCategoryRoutes);
router
  .route("/:id")
  .get(getBrandValidators, getBrand)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImages,
    updateBrandValidators,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteBrandValidators,
    deleteBrand
  );
module.exports = router;
