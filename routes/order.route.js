const express = require("express");
const router = express.Router();
const {
  createCashOrder,
  getAllOrders,
  filterOrdersForLoggedUser,
  getSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  getCheckoutSession,
} = require("../controllers/order.controller");
const { protect, allowedTo } = require("../controllers/auth.controller");
router.use(protect);
// @desc create cash order
router.route("/:cartId").post(allowedTo("user"), createCashOrder);
router.get(
  "/",
  allowedTo("manager", "admin", "user"),
  filterOrdersForLoggedUser,
  getAllOrders
);
router.get("/:id", getSpecificOrder);
router.get("/checkout-session/:cartId", allowedTo("user"), getCheckoutSession);
router.put("/:orderId/paid", allowedTo("admin", "manager"), updateOrderToPaid);
router.put(
  "/:orderId/deliver",
  allowedTo("admin", "manager"),
  updateOrderToDelivered
);
module.exports = router;
