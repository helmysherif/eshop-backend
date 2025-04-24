const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const OrderModel = require("../models/order.model");
const ApiError = require("../utils/apiError");
const CartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const factory = require("./handlersFactory");
exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filteredObj = { user: req.user._id };
  }
  next();
});
// @desc create cash order
// @route POST /api/v1/order/:cartId
// @access private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1- get the cart depend on the cartId
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart)
    return next(
      new ApiError(`there is no cart with id:${req.params.cartId}`, 404)
    );
  // 2- get order price depend on the cart price if there is a coupon apply it
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3- create the order with default payment method cash
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });
  if (!order)
    return next(new ApiError("there is a problem in creating your order", 400));
  // 4- after creating the order decrease the product quantity and increase the sold quantity
  const bulkOptions = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product._id },
      update: {
        $inc: {
          quantity: -item.quantity,
          sold: +item.quantity,
        },
      },
      options: { new: true },
    },
  }));
  await productModel.bulkWrite(bulkOptions, {});
  // 5- clear the cart items
  await CartModel.findByIdAndDelete(req.params.cartId);
  res.status(201).json({
    status: "success",
    message: "order created successfully",
    data: {
      order,
    },
  });
});
// @desc get all orders
// @route GET /api/v1/order
// @access private
exports.getAllOrders = factory.getAll(OrderModel);
// @desc get specific order
// @route GET /api/v1/order/:order
// @access private
exports.getSpecificOrder = factory.getOne(OrderModel);
// @desc change order paid status to paid
// @route PUT /api/v1/order/:orderId
// @access private/admin
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order)
    return next(
      new ApiError(`there is no order with id:${req.params.orderId}`, 404)
    );
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    message: "order paid successfully",
    data: {
      order: updatedOrder,
    },
  });
});
// @desc change order delivered status to delivered
// @route PUT /api/v1/order/:orderId
// @access private/admin
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order)
    return next(
      new ApiError(`there is no order with id:${req.params.orderId}`, 404)
    );
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    message: "order paid successfully",
    data: {
      order: updatedOrder,
    },
  });
});
// @desc get checkout session from stripe and send it as a response
// @route GET /api/v1/order/checkout-session/:cartId
// @access private/user
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart)
    return next(
      new ApiError(`there is no cart with id:${req.params.cartId}`, 404)
    );
  // 2- get order price depend on the cart price if there is a coupon apply it
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `order from ${req.user.name}`,
            description: `order from ${req.user.name}`,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  res.status(200).json({
    status: "success",
    message: "checkout session created successfully",
    session,
  });
});
