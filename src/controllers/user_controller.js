const asyncWrapper = require("../middlewares/asyncWrappers");
const userModel = require("../models/user_model");
const BadRequestError = require("../errors/bad_request_error");
const { StatusCodes } = require("http-status-codes");
const UnauthenticatedError = require("../errors/unauthenticated");
const generateJwtToken = require("../utils/jwt");
const CustomAPIError = require("../errors/custom_api_error");
const nodeMailer = require("nodemailer");
const sharp = require("sharp");
const fs = require("fs");

const createNewUser = asyncWrapper(async (req, res, next) => {
  const { name, password, email } = req.body;

  const isEmailAlreadyExists = await userModel.findOne({
    email: req.body.email,
  });
  if (isEmailAlreadyExists) {
    throw new BadRequestError("email is already exists!");
  }

  // default 1st user is admin
  const isFirstAccount = (await userModel.countDocuments({})) === 0;
  const OTP = Math.floor(Math.random() * (90000 - 10000 + 1) + 10000);
  console.log("having file....");
  //for file uploading
  let strPhotoURL = "";

  strPhotoURL = req.file.path;
  const buffer = await sharp(req.file.path.toString())
    //.resize({ width: 550, height: 550 })
    .png()
    .toBuffer()
    .then((b) => {
      fs.writeFile(req.file.path.toString(), b, function (err, result) {
        if (err) {
          console.log("error", err);
          return callback(
            new Error("Only images (.png,.jpg,.gif,.jpeg) are allowed")
          );
        }
      });
    });
  const role = isFirstAccount ? "admin" : "user";
  const user = await userModel.create({
    name,
    email,
    password,
    role,
    photo: strPhotoURL,
    OTP,
  });
  if (user) {
    await emailSend(req, res, {
      email: email,
      name: name,
      otp: OTP,
      user: user,
      subject: "User Registration",
    });
  } else {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: 0, message: "something went wrong on creating user " });
  }
});

const emailSend = async (req, res, { email, name, otp, user, subject }) => {
  // for sending email
  console.log("in to emial send.... " + email);
  console.log("in to emial send.... " + name);
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "pragnabhatt.iipl@gmail.com",

      // pass: "MyPwd@!@#4@",
      pass: "ldgqntblmrkswmsc",
      // from where i found is https://myaccount.google.com/apppasswords?rapt=AEjHL4NMXkY3SXGxXK01KRaXT7p1NG6m1ZvEjhA81VF7E2CCQQw3ICb_AhDYHuvqnw97-vYuBC0PVw1XKotjHiDFh8giCszRDQ
      // check https://myaccount.google.com/apppasswords?rapt=AEjHL4NMXkY3SXGxXK01KRaXT7p1NG6m1ZvEjhA81VF7E2CCQQw3ICb_AhDYHuvqnw97-vYuBC0PVw1XKotjHiDFh8giCszRDQ
      // check 2 https://protocoderspoint.com/solution-nodemailer-username-and-password-not-accepted/
    },
  });
  var html = "<b>Hello, " + name + "</b> <p>please find OTP :" + otp + "</p>";

  if (!otp) {
    html = "<b> Hello," + name + ", welcome to our portal";
  }

  let mailOptions = {
    from: '"Pragna Bhatt" <pragnavbhatt@gmail.com>', // sender address

    to: email, // list of receivers

    subject: subject, // Subject line
    text: "Hello",
    // plain text body
    // html: "<b>NodeJS Email Tutorial</b>", // html body

    html: html, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // return
      console.log(error);
      // res
      //   .status(StatusCodes.NOT_FOUND)
      //   .json({ status: 0, message: "something went wrong on sending email " });
      res.status(StatusCodes.OK).json({
        status: 1,
        message: subject + " sucessfully,But we are unable to send email",
        user,
      });
    }
    console.log("Message %s sent: %s", info.messageId, info.response);

    res.status(StatusCodes.OK).json({
      status: 1,
      message: subject + " sucessfully,Please check your email",
      user,
    });

    // res
    //   .status(StatusCodes.OK)
    //   .json({ status: 1, message: "please check email " });
  });
};

// verify user for login after user registration

const verifyNewUser = asyncWrapper(async (req, res, next) => {
  const { email, OTP } = req.body;
  if (!email || !OTP) {
    throw new BadRequestError("please provide email and OTP for varification ");
  }
  const user = await userModel.findOne({ email, OTP });
  if (!user) {
    throw new UnauthenticatedError(
      "verification failed email address and OTP not matched "
    );
  }
  const userUpdate = await userModel
    .findOneAndUpdate(
      {
        email,
      },
      {
        isVerified: true,
      },
      {
        new: true,
        runValidators: true,
      }
    )
    .select("-password");

  await emailSend(req, res, {
    email: userUpdate.email,

    name: userUpdate.name,

    //otp: OTP,
    user: userUpdate,

    subject: "Verify User",
  });

  // res.status(StatusCodes.OK).json({ userUpdate });
});

// resend OTP
const reSendOTP = asyncWrapper(async (req, res, next) => {
  if (!req.body.email) {
    throw new BadRequestError("please provide email");
  }
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    throw new UnauthenticatedError("user not found!");
  }

  const OTP = Math.floor(Math.random() * (90000 - 10000 + 1) + 10000);
  user.OTP = OTP;
  user.save();
  if (user) {
    await emailSend(req, res, {
      email: user.email,
      name: user.name,
      otp: OTP,
      user: user,
      subject: "Re-send OTP",
    });
  } else {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: 0, message: "something went wrong on OTP regeration " });
  }

  // res.status(StatusCodes.OK).json({
  //   status: 1,
  //   message: "your OTP is " + OTP,
  // });
});

// for login user

const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("please provide email and password");
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError("user is not verified yet");
  }
  if (!user.isActive) {
    throw new UnauthenticatedError("user is not active ");
  }

  // .select("-password");
  // const user = userModel.email == email; //.select("-password");//want to check it

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials!");
  }
  const token = generateJwtToken(user._id);
  console.log("token...." + token);
  // user.tokens = {};
  // user.tokens
  // user.tokens=
  // user.tokens = user.tokens.concat({ token });
  user.tokens = { token };

  user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 1, message: "user login sucessfully ", user });
});
// update user
const updateUser = asyncWrapper(async (req, res, next) => {
  const fieldsToupdate = Object.keys(req.body);

  const allowedFieldToUpdate = ["name", "email"];
  const isValidForUpdate = true;
  fieldsToupdate.forEach((element) => {
    if (!allowedFieldToUpdate.includes(element)) {
      isValidForUpdate = false;
    }
  });
  if (isValidForUpdate) {
    // below strp not required after auth user
    const user = req.authUser;
    user.name = req.body.name;
    user.save();
    // user.email = req.body.email;
    // const updateUser = await userModel.findOneAndUpdate(
    // {
    //     email: req.body.email,
    // },
    // {
    //     // email: req.body.email,
    //     name: req.body.name,
    // },
    // { new: true, runValidators: true }
    // );
    // if (!updateUser) {
    // throw new UnauthenticatedError("no such user found!");
    // }
    res
      .status(StatusCodes.OK)
      .json({ status: 1, message: "user updated sucessfully", user });
  }
});
//forgot password

const forgotPassword = asyncWrapper(async (req, res, next) => {
  if (!req.body.email) {
    throw new BadRequestError("please provide email");
  }
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    throw new UnauthenticatedError("user not found!");
  }

  const OTP = Math.floor(Math.random() * (90000 - 10000 + 1) + 10000);
  user.OTP = OTP;
  user.save();
  // res.status(StatusCodes.OK).json({
  //   status: 1,
  //   message: "your OTP is " + OTP,
  // });

  if (user) {
    await emailSend(req, res, {
      email: user.email,
      name: user.name,
      otp: OTP,
      user: user,
      subject: "OTP",
    });
  } else {
    res.status(StatusCodes.NOT_FOUND).json({
      status: 0,
      message: "something went wrong on forgotPassword process  ",
    });
  }
});

const changePassword = asyncWrapper(async (req, res, next) => {
  if (!req.body.oldPassword) {
    throw new BadRequestError("please provide old password");
  }
  if (!req.body.newPassword) {
    throw new BadRequestError("please provide new Password");
  }
  if (req.body.newPassword + "".length < 6) {
    throw new BadRequestError(
      "password is too short, please provide proper password"
    );
  }

  const user = req.authUser;
  const isPasswordCorrect = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError(
      "Invalid Password, not authorized to change password!"
    );
  }
  if (!req.body.confirmPassword) {
    throw new BadRequestError("please provide confirm Password");
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    throw new CustomAPIError("newPassword and confirmPassword not matching");
  }

  user.password = req.body.newPassword;

  user.save();
  // await userModel.findOneAndUpdate(
  //   {
  //     email: user.email,
  //   },
  //   { password: req.body.confirmPassword },
  //   {
  //     new: true,
  //     runValidators: true,
  //   }
  // );

  res
    .status(StatusCodes.OK)
    .json({ status: 1, message: "password reset sucessfully" });
});
const logOut = asyncWrapper(async (req, res, next) => {});
module.exports = {
  createNewUser,
  verifyNewUser,
  reSendOTP,
  loginUser,
  updateUser,
  forgotPassword,
  changePassword,
  logOut,
};
