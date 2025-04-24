const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const BrandModel = require("../models/brand.model");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
exports.uploadBrandImage = uploadSingleImage("image");
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  next();
});
// @desc create new brand
// @route POST /api/v1/brands
// @access private
exports.createBrand = factory.createOne(BrandModel);
// @desc get all brands
// @route GET /api/v1/brands
// @access public
exports.getAllBrands = factory.getAll(BrandModel, "name");
// @desc get specific brand by id
// @route GET /api/v1/brands/:id
// @access public
exports.getBrand = factory.getOne(BrandModel);
// @desc update brand
// @route PUT /api/v1/brands/:id
// @access private
exports.updateBrand = factory.updateOne(BrandModel);
// @desc delete brand
// @route DELETE /api/v1/brands/:id
// @access private
exports.deleteBrand = factory.deleteOne(BrandModel);
// @desc get brands count
// @route get /api/v1/brands/count
// @access private
exports.getBrandsCount = factory.getCount(BrandModel);
