const asyncHandler = require("express-async-handler");
const CartModel = require("../models/cart.model");
const ApiError = require("../utils/apiError");
const ProductModel = require("../models/product.model");
const CouponModel = require("../models/coupon.model");
// @desc add product to cart
// @route POST /api/v1/cart
// @access private/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(
      new ApiError(`No product found with this id:${productId}`, 404)
    );
  }
  // check if the product is in stock
  if (product.quantity === 0)
    return next(new ApiError(`this product is out of stock`, 400));
  // check if the product color is available
  if (!product.colors.includes(color)) {
    return next(
      new ApiError(`this color is not available for this product`, 400)
    );
  }
  // 1- get cart for the logged in user
  let cart = await CartModel.findOne({ user: req.user._id });
  // 2- if cart not found create new cart
  if (!cart) {
    // create new cart for logged in user
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // 1- if product already exists in cart , update the quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      // update the quantity of the product in cart
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cartItem.price = product.price * cartItem.quantity;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // 2- if product not exists in cart , push new product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
    // calculate total price of cart
  }
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price,
    0
  );
  cart.totalPriceAfterDiscount = undefined; // reset the total price after discount
  await cart.save();
  return res.status(201).json({
    status: "success",
    message: "Product added to cart successfully",
    data: cart,
  });
});
// @desc get logged in user cart
// @route GET /api/v1/cart
// @access private/user
exports.getUserCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id }).populate({
    path: "cartItems.product",
    select: "title price imageCover quantity", // Choose what fields you want to return
  });
  if (!cart) {
    return next(
      new ApiError(`there is no cart for this userId: ${req.user._id}`, 404)
    );
  }
  res.status(200).json({
    status: "success",
    message: "User cart fetched successfully",
    cart,
    numberOfCartItems: cart.cartItems.length,
  });
});
// @desc remove product from cart
// @route DELETE /api/v1/cart/:productId
// @access private/user
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        cartItems: { _id: req.params.itemId },
      },
    },
    { new: true }
  );
  if (!cart) {
    return next(
      new ApiError(`there is no cart for this userId: ${req.user._id}`, 404)
    );
  }
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price,
    0
  );
  cart.totalPriceAfterDiscount = undefined; // reset the total price after discount
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
    cart,
    numberOfCartItems: cart.cartItems.length,
  });
});
// @desc remove all items from cart
// @route DELETE /api/v1/cart/:productId
// @access private/user
exports.removeAllItemsFromCart = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});
// @desc update product quantity in cart
// @route PUT /api/v1/cart/:productId
// @access private/user
exports.updateProductQuantityInCart = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  const cart = await CartModel.findOne({ user: req.user._id }).populate({
    path: "cartItems.product",
    select: "title price imageCover quantity", // Choose what fields you want to return
  });
  if (!cart) {
    return next(
      new ApiError(`there is no cart for this userId: ${req.user._id}`, 404)
    );
  }
  const cartItemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );
  if (cartItemIndex > -1) {
    const cartItem = cart.cartItems[cartItemIndex];
    // check if the quantity is greater than the product quantity
    if (quantity > cartItem.product.quantity) {
      return next(
        new ApiError(
          `the quantity is greater than the product quantity: ${cartItem.product.quantity}`,
          400
        )
      );
    }
    cartItem.quantity = +quantity;
    cartItem.price = cartItem.product.price * quantity;
    cart.cartItems[cartItemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there is no cart item with this id: ${itemId}`, 404)
    );
  }
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price,
    0
  );
  cart.totalPriceAfterDiscount = undefined; // reset the total price after discount
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product quantity updated successfully",
    cart,
    numberOfCartItems: cart.cartItems.length,
  });
});
// @desc apply coupon to cart
// @route PUT /api/v1/cart/applycoupon
// @access private/user
exports.applyCouponToCart = asyncHandler(async (req, res, next) => {
  // 1- get the coupon from the request body
  const coupon = await CouponModel.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError(`coupon is invalid or expired`, 404));
  }
  // 2- get the cart for the logged in user
  const cart = await CartModel.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;
  // calculate the total price after applying the coupon
  const totalPriceAfterDiscount = +(
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount; // reset the total price after discount
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    cart,
    totalPriceAfterDiscount,
  });
});
