const asyncHandler = require("express-async-handler");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/apiError");
// @desc add address to user addresses list
// @route POST /api/v1/user/address
// @access private/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  // addToSet will add the address to the user addresses list if it is not already present
  // if it is already present it will not add it again
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    message: "address added successfully to your addresses list",
    status: "success",
    addresses: user.addresses,
  });
});
// @desc remove address from user addresses list
// @route DELETE /api/v1/user/address/:id
// @access private/user
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  // $pull removes the address from the user addresses list
  // if it is present in the list it will remove it
  // if it is not present it will not do anything
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    message: "address successfully from your addresses list",
    status: "success",
    data: user.addresses,
  });
});
// @desc get all addresses of the logged in user
// @route GET /api/v1/user/addresses
// @access private/user
exports.getLoggedInUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("addresses");
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
