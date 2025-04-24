const multer = require("multer");
const ApiError = require("../utils/apiError");
const multerOptions = () => {
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: (req, file, cb) => {
  //     const extension = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${extension}`;
  //     cb(null, filename);
  //   },
  // });
  const multerStorage = multer.memoryStorage();
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images are allowed", 400), false);
    }
  };
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
  return upload;
};
exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);
exports.uploadMixOfImages = (fieldsArray) =>
  multerOptions().fields(fieldsArray);
