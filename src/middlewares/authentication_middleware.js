const jwt = require("jsonwebtoken");
const CustomAPIError = require("../errors/custom_api_error");
const UnauthenticatedError = require("../errors/unauthenticated");
const userModel = require("../models/user_model");
const asyncWrapper = require("./asyncWrappers");

const auth = asyncWrapper(async (req, res, next) => {
  console.log("in to authenticationn");
  console.log(req.header("authorization"));
  var token = req.header("authorization");
  console.log("header token.... !!! " + token);

  // if (token + "".length == 0) {
  if (!token) {
    throw new UnauthenticatedError("token not found");
  }
  token = token.replace("Bearer ", "");
  console.log("header token.... " + token);
  console.log(req.body);
  const decoded = jwt.verify(token, "PraGna");

  console.log("decoded " + decoded.data); // check utils jwt.js

  const authUser = await userModel.findOne({
    _id: decoded.data, //check utils jwt.js
    "tokens.token": token,
  });

  if (!authUser) {
    // res.status(500).send({ msg: "No such user found " });
    throw new UnauthenticatedError("no such user foundqqqq!");
  }

  console.log("isVerified " + authUser.isVerified); // check utils jwt.js

  if (!authUser.isVerified) {
    throw new UnauthenticatedError("user is not verified yet");
  }
  if (!authUser.isActive) {
    throw new UnauthenticatedError("user is not active ");
  }

  req.authUser = authUser;

  next();
});

const authBeforeLogin = asyncWrapper(async (req, res, next) => {
  console.log("in to authenticationn");
  console.log(req.header("authorization"));
  const token = req.header("authorization").replace("Bearer ", "");
  console.log("header token.... " + token);
  console.log(req.body);
  const decoded = jwt.verify(token, "PraGna");

  console.log("decoded " + decoded.data); // check utils jwt.js

  const authUser = await userModel.findOne({
    _id: decoded.data, // check utils jwt.js
    "tokens.token": token,
  });

  if (!authUser) {
    // res.status(500).send({ msg: "No such user found " });
    throw new UnauthenticatedError("no such user foundqqqq!");
  }
  req.authUser = authUser;

  next();
});

module.exports = { auth, authBeforeLogin };
