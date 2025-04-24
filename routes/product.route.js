const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsCount,
  uploadProductsImages,
  resizeProductImages,
} = require("../controllers/product.controller");
const authService = require("../controllers/auth.controller");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const reviewsRouter = require("./review.route");
const router = express.Router();
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductsImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  )
  .get(getAllProducts);
router
  .route("/count")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getProductsCount
  );
// POST /products/:productId/reviews
// GET /products/:productId/reviews
// GET /products/:productId/reviews/:reviewId
router.use("/:productId/reviews", reviewsRouter);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductsImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );
module.exports = router;
