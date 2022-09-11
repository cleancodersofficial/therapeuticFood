const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");
const { string } = require("sharp/lib/is");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "user name is required"],
    minlength: [3, "name is too short"],
    maxlength: [30, "name is too long"],
  },
  tokens: [
    {
      token: { type: String, trim: true, required: true },
    },
  ],
  OTP: { type: String, trim: true },
  photo: {
    type: String,
  },

  email: {
    type: String,
    unique: true,
    required: [true, "email address is required"],
    validate: {
      validator: isEmail,
      message: "please provide valid email address",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "password is too short"],
    maxlength: [130, "password is too long"],
  },
  userRole: {
    type: String,
    enum: ["user", "admin"],
    required: true,
    default: "user",
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },

  productsLikes: [
    {
      productsLike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodModel",
      },
    },
  ],

  
});
// remove data from json
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

userSchema.pre("save", async function () {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});
// userSchema.statics.countNoOfLikes = async function (postId) {
//   console.log("in to countNoOfLikes");
//   const result = await this.aggregate([
//     { $match: { "postLikes.postLike": postId } },
//     {
//       $group: {
//         _id: null,
//         numberOfLikes: { $sum: 1 },
//       },
//     },
//   ]);

//   console.log("result..... " + result[0].numberOfLikes);
// };
// userSchema.post("save", async function () {
//     console.log("in to save...."+this)
//
//     await this.constructor.countNoOfLikes(this.postLikes.postLike)
// });
/*userSchema.post("findOneAndUpdate", async function () {
    console.log("in to update....")
    console.log("in to update...."+this)

    await this.constructor.countNoOfLikes(postLikes.postLike);
})*/
userSchema.methods.comparePassword = async function (passwordToCompare) {
  const isMatch = await bcrypt.compare(passwordToCompare, this.password);
  return isMatch;
};
userSchema.index(
  {
    _id: 1,
    productsLikes: 1,
  },
  { unique: true }
);

// userSchema.virtual("comments", {
//   ref: "Comment",
//   localField: "_id",
//   foreignField: "user",
//   justOne: false,
// });

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
