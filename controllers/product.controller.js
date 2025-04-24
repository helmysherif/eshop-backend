const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ProductModel = require("../models/product.model");
const factory = require("./handlersFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
exports.uploadProductsImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // image processing for imageCover
  if (req.files && req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);
    req.body.imageCover = imageCoverFileName;
  }
  // image processing for images
  if (req.files && req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageFileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageFileName}`);
        req.body.images.push(imageFileName);
      })
    );
  }
  next();
});
// @desc create new product
// @route POST /api/v1/products
// @access private
exports.createProduct = factory.createOne(ProductModel);
// @desc get all products
// @route GET /api/v1/products
// @access public
exports.getAllProducts = factory.getAll(ProductModel, "title", "description");
// @desc get specific product by id
// @route GET /api/v1/products/:id
// @access public
exports.getProduct = factory.getOne(ProductModel, "reviews");
// @desc update product
// @route PUT /api/v1/products/:id
// @access private
exports.updateProduct = factory.updateOne(ProductModel);
// @desc delete product
// @route DELETE /api/v1/products/:id
// @access private
exports.deleteProduct = factory.deleteOne(ProductModel);
// @desc get product count
// @route get /api/v1/products/count
// @access private
exports.getProductsCount = factory.getCount(ProductModel);
