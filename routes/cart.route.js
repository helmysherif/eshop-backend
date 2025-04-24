const express = require("express");
const router = express.Router();
const {
  addProductToCart,
  getUserCart,
  removeProductFromCart,
  removeAllItemsFromCart,
  updateProductQuantityInCart,
  applyCouponToCart,
} = require("../controllers/cart.controller");
const { protect, allowedTo } = require("../controllers/auth.controller");
router.use(protect, allowedTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getUserCart)
  .delete(removeAllItemsFromCart);
router.put("/applycoupon", applyCouponToCart);
router
  .route("/:itemId")
  .delete(removeProductFromCart)
  .put(updateProductQuantityInCart);
module.exports = router;
