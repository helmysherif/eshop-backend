const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ProductModel = require("../../models/product.model");
exports.addProducttoWishlistValidators = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid product ID Format")
    .custom((productId) =>
      ProductModel.findById(productId).then((product) => {
        if (!product)
          return Promise.reject(
            new Error(`no product for this Id: ${productId}`)
          );
      })
    ),
  validatorMiddleware,
];
exports.deleteProductFromWishListValidators = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid product ID Format")
    .custom((productId) =>
      ProductModel.findById(productId).then((product) => {
        if (!product)
          return Promise.reject(
            new Error(`no product for this Id: ${productId}`)
          );
      })
    ),
  validatorMiddleware,
];
