const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/createToken");
// @desc signUp
// @route POST /api/v1/auth/signup
// @access public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const { name, email, password } = req.body;
  const user = await UserModel.create({ name, email, password });
  res.status(201).json({ data: user, token: generateToken(user._id) });
});
// @desc login
// @route POST /api/v1/auth/login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  res.status(200).json({ data: user, token: generateToken(user._id) });
});
// make sure the user is logged In
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists if it exists get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not loggedIn, please login to get access this route",
        401
      )
    );
  }
  // 2- verify token (expired token or no changes on token)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3- check if user exists
  const currentUser = await UserModel.findById(decodedToken.userId);
  if (!currentUser || (currentUser && !currentUser.active)) {
    return next(
      new ApiError(
        "the user that belong to this token does no longer exists",
        401
      )
    );
  }
  // 4- check if user change his password after token is created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // password changed after token created
    if (passwordChangedTimestamp > decodedToken.iat) {
      return next(
        new ApiError(
          "the user recently changed his password, please login again..",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});
// @desc Authorization (User Permissions)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- access the roles
    // 2- access the registered user
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });
// @desc forget password
// @route POST /api/v1/auth/forgotPassword
// @access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- get user by email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with this email: ${req.body.email}`, 404)
    );
  }
  // 2- if user exists => generate random 6 digits code and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hashed reset code in db
  user.passwordResetCode = hashedResetCode;
  // add expiration time for password reset code (10 min)
  user.passwordResetCodeExpired = Date.now() + 10 * 60 * 1000;
  user.passwordResetCodeVerified = false;
  await user.save();
  // 3- send the reset code via email
  const message = `
    Hi ${user.name}, \n We received a request to reset the password on your Ecommerce app account.\n
    ${resetCode} \n enter the code to complete the reset. \n Thanks for helping us keep your account secure.
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid) for 10 min",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpired = undefined;
    user.passwordResetCodeVerified = undefined;
    await user.save();
    return next(new ApiError("there is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "success", message: "Reset code is sent to your mail" });
});
// @desc verify reset password code
// @route POST /api/v1/auth/verifyCode
// @access public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1- get the user depend on the reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("reset code invalid or expired"));
  }
  user.passwordResetCodeVerified = true;
  await user.save();
  res.status(200).json({ status: "success" });
});
// @desc reset password
// @route POST /api/v1/auth/resetPassword
// @access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get user based on the email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with email: ${req.body.email}`, 404)
    );
  }
  // check if the reset code is verified or not
  if (!user.passwordResetCodeVerified) {
    return next(new ApiError(`reset code is not verified`, 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpired = undefined;
  user.passwordResetCodeVerified = undefined;
  await user.save();
  // generate new token
  const token = generateToken(user._id);
  res.status(200).json({ status: "success", token });
});
