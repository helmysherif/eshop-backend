const express = require("express");
const authService = require("../controllers/auth.controller");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");
const { addCouponValidator } = require("../utils/validators/couponValidator");
const router = express.Router();
router.use(authService.protect, authService.allowedTo("admin", "manager"));
router.route("/").post(addCouponValidator, createCoupon).get(getAllCoupons);
router.route("/:id").delete(deleteCoupon).put(updateCoupon).get(getCoupon);
module.exports = router;
