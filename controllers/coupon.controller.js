const factory = require("./handlersFactory");
const CouponModel = require("../models/coupon.model");
// @desc create new coupon
// @route POST /api/v1/coupons
// @access private
exports.createCoupon = factory.createOne(CouponModel);
// @desc get all coupons
// @route GET /api/v1/coupons
// @access private
exports.getAllCoupons = factory.getAll(CouponModel);
// @desc get specific coupon by id
// @route GET /api/v1/coupons/:id
// @access private
exports.getCoupon = factory.getOne(CouponModel);
// @desc update coupon
// @route PUT /api/v1/coupons/:id
// @access private
exports.updateCoupon = factory.updateOne(CouponModel);
// @desc delete coupon
// @route DELETE /api/v1/coupons/:id
// @access private
exports.deleteCoupon = factory.deleteOne(CouponModel);
