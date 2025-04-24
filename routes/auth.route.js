const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/auth.controller");
const {
  signUpValidator,
  loginValidator,
} = require("../utils/validators/authValidator");
// const subCategoryRoutes = require("./subCategory.route");
const router = express.Router();
router.route("/signup").post(signUpValidator, signup);
router.route("/login").post(loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyCode", verifyResetCode);
router.post("/resetPassword", resetPassword);
module.exports = router;
