const express = require("express");
const authService = require("../controllers/auth.controller");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedInUserWishlist,
} = require("../controllers/wishlist.controller");
const {
  addProducttoWishlistValidators,
  deleteProductFromWishListValidators,
} = require("../utils/validators/wishlistValidator");
const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addProducttoWishlistValidators, addProductToWishlist)
  .get(getLoggedInUserWishlist);
router
  .route("/:productId")
  .delete(deleteProductFromWishListValidators, removeProductFromWishlist);
module.exports = router;
