const express = require("express");
const authService = require("../controllers/auth.controller");
const {
  addAddress,
  deleteAddress,
  getLoggedInUserAddresses,
} = require("../controllers/address.controller");
const { addAdressValidator } = require("../utils/validators/addressValidator");
const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addAdressValidator, addAddress)
  .get(getLoggedInUserAddresses);
router.route("/:addressId").delete(deleteAddress);
module.exports = router;
