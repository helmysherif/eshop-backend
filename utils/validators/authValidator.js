const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const UserModel = require("../../models/user.model");
exports.signUpValidator = [
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
  validatorMiddleware,
];
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("user email is required")
    .isEmail()
    .withMessage("invalid email format"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  validatorMiddleware,
];
