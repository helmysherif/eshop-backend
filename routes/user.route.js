const express = require("express");
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersCount,
  uploadUserImage,
  resizeImages,
  deactivateUser,
  changeUserPassword,
  getLoggedInUser,
  updateLoggedInUserPassword,
  updateLoggedInUserData,
} = require("../controllers/user.controller");
const authService = require("../controllers/auth.controller");
const {
  createUserValidator,
  getUserValidators,
  updateUserValidators,
  deleteUserValidators,
  changeUserPasswordValidator,
  updateLoggedInUserValidators,
} = require("../utils/validators/userValidator");
// const subCategoryRoutes = require("./subCategory.route");
const router = express.Router();
router.get("/getMe", authService.protect, getLoggedInUser, getUser);
router.put(
  "/updateMyPassword",
  authService.protect,
  updateLoggedInUserPassword
);
router.put(
  "/updateMyData",
  authService.protect,
  updateLoggedInUserValidators,
  updateLoggedInUserData
);
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImages,
    createUserValidator,
    createUser
  )
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getAllUsers
  );
router
  .route("/count")
  .get(authService.protect, authService.allowedTo("admin"), getUsersCount);
// router.use("/:categoryId/subcategories", subCategoryRoutes);
router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin"),
    getUserValidators,
    getUser
  )
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImages,
    updateUserValidators,
    updateUser
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteUserValidators,
    deleteUser
  );
router.put(
  "/deactivate/:id",
  authService.protect,
  authService.allowedTo("admin"),
  deactivateUser
);
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
module.exports = router;
