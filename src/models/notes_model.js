const mongoose = require("mongoose");
const noteSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, " description is required"],
      minlength: [5, "description length minimum is 100"],
      maxlength: [1000, "description length maximum is 1000"],
      trim: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodModel",
      required: true,
    },
  },
  { timestamps: true }
);

const noteModel = mongoose.model("Notes", noteSchema);

module.exports = noteModel;
