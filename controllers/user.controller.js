const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/createToken");
exports.uploadUserImage = uploadSingleImage("profileImage");
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    req.body.profileImage = filename;
  }
  next();
});
// @desc create new user
// @route POST /api/v1/users
// @access private
exports.createUser = factory.createOne(UserModel);
// @desc get all users
// @route GET /api/v1/users
// @access private
exports.getAllUsers = factory.getAll(UserModel, "name");
// @desc get specific user by id
// @route GET /api/v1/users/:id
// @access private
exports.getUser = factory.getOne(UserModel);
// @desc update user
// @route PUT /api/v1/users/:id
// @access private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      slug: req.body.slug,
      profileImage: req.body.profileImage,
      role: req.body.role,
      active: req.body.active,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError("no document found", 404));
  }
  res
    .status(201)
    .json({ message: "document is updated successfully", document });
});
// @desc change user password
// @route DELETE /api/v1/users/:id
// @access public
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError("no document found", 404));
  }
  res
    .status(201)
    .json({ message: "document is updated successfully", document });
});
// @desc delete user
// @route DELETE /api/v1/users/:id
// @access private
exports.deleteUser = factory.deleteOne(UserModel);
// @desc delete user
// @route DELETE /api/v1/users/:id
// @access private
exports.deactivateUser = factory.deactivateUser(UserModel);
// @desc get user count
// @route get /api/v1/user/count
// @access private
exports.getUsersCount = factory.getCount(UserModel);
// @desc get loggedIn user
// @route get /api/v1/user/getMe
// @access public
exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  req.params.id = req.user._id;
  next();
});
// @desc update loggedIn user password
// @route put /api/v1/user/updateMyPassword
// @access public
exports.updateLoggedInUserPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("no document found", 404));
  }
  const token = generateToken(user._id);
  res
    .status(201)
    .json({ message: "document is updated successfully", user, token });
});
// @desc update loggedIn user data (without password and role)
// @route put /api/v1/user/updateMyData
// @access public
exports.updateLoggedInUserData = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("no user found", 404));
  }
  res.status(201).json({ message: "user is updated successfully", user });
});
