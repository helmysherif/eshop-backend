const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const UserModel = require("../../models/user.model");
exports.getUserValidators = [
  check("id").isMongoId().withMessage("Invalid user ID Format"),
  validatorMiddleware,
];
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("user name is required")
    .isLength({ min: 3 })
    .withMessage("user name is too short")
    .isLength({ max: 40 })
    .withMessage("user name is too long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("user email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already exists"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required"),
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone format"),
  check("active").optional(),
  validatorMiddleware,
];
exports.updateUserValidators = [
  check("id").isMongoId().withMessage("Invalid user ID Format"),
  check("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid email format")
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already exists"));
        }
      })
    ),
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone format"),
  check("active").optional(),
  validatorMiddleware,
];
exports.updateLoggedInUserValidators = [
  check("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid email format")
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already exists"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone format"),
  check("active").optional(),
  validatorMiddleware,
];
exports.deleteUserValidators = [
  check("id").isMongoId().withMessage("Invalid user ID Format"),
  validatorMiddleware,
];
exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user ID Format"),
  check("oldPassword").notEmpty().withMessage("old password is required"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required"),
  check("password")
    .notEmpty()
    .withMessage("new password is required")
    .custom(async (password, { req }) => {
      // verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error("there is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("incorrect old password");
      }
      // verify confirm password == new password
      if (password !== req.body.confirmPassword) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];
