const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
exports.addAdressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("address alias is required")
    .isLength({ min: 3 })
    .withMessage("address alias must be at least 3 characters long")
    .custom((value, { req }) => {
      const address = req.user.addresses.find(
        // eslint-disable-next-line no-shadow
        (address) => address.alias === value
      );
      if (address) {
        throw new Error("address alias must be unique");
      }
      return true;
    }),
  check("details")
    .notEmpty()
    .withMessage("address details is required")
    .isLength({ min: 10 })
    .withMessage("address details must be at least 10 characters long"),
  check("city")
    .notEmpty()
    .withMessage("address city is required")
    .isLength({ min: 3 })
    .withMessage("address city must be at least 3 characters long"),
  check("postalCode")
    .notEmpty()
    .withMessage("address postal code is required")
    .isPostalCode("any")
    .withMessage("address postal code is not valid"),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("address phone number is not valid"),
  validatorMiddleware,
];
