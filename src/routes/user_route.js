const express = require("express");
//middleware
const {
  auth,
  authBeforeLogin,
} = require("../middlewares/authentication_middleware");

const {
  createNewUser,
  verifyNewUser,
  reSendOTP,

  loginUser,
  updateUser,
  changePassword,

  forgotPassword,
} = require("../controllers/user_controller");
const uploadFile = require("../middlewares/fileupload_middleware");

const userRoute = express.Router();

userRoute
  .route("/createNewUser")
  .post(uploadFile.single("userPhoto"), createNewUser);
userRoute.route("/verifyNewUser").post(verifyNewUser);
userRoute.route("/reSendOTP").get(reSendOTP);

// userRoute.route("/loginUser").post(auth, loginUser);
userRoute.route("/loginUser").post(loginUser);

userRoute.route("/updateUser").patch(auth, updateUser);
userRoute.route("/changePassword").post(auth, changePassword);

userRoute.route("/forgotPassword").post(auth, forgotPassword);
//logout should be delete to delete all cookies

module.exports = userRoute;
