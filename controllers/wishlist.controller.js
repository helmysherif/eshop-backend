const asyncHandler = require("express-async-handler");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/apiError");
// @desc add product to wishlist
// @route POST /api/v1/wishlist
// @access private/user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // addToSet will add the productId to the wishlist if it is not already present
  // if it is already present it will not add it again
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishList: req.body.productId },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    message: "product added successfully to your wishlist",
    status: "success",
    data: user.wishList,
  });
});
// @desc remove product from wishlist
// @route DELETE /api/v1/wishlist/:id
// @access private/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishList: req.params.productId },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    message: "product removed successfully from your wishlist",
    status: "success",
    data: user.wishList,
  });
});
// @desc get products from wishlist
// @route GET /api/v1/wishlist
// @access private/user
exports.getLoggedInUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishList");
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    status: "success",
    results: user.wishList.length,
    data: user.wishList,
  });
});
