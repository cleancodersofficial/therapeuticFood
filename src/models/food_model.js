const mongoose = require("mongoose");
var random = require("mongoose-random");

const foodSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Beans Legumes",
        "Fruits",
        "Grains",
        "NutsSeeds Oils",
        "Seafood",
        "Vegetables",
      ],
      required: true,
      default: "user",
    },

    name: {
      type: String,
      required: true,
      minlength: [3, "name is too short"],
      maxlength: [90, "name is too big"],
    },
    image: {
      type: String,
    },

    description: {
      type: String,
      required: true,
      minlength: [3, "name is too short"],
    },
    NutritionalBenefits: {
      type: String,
    },
    HealthBenefits: {
      type: String,
    },
    ConsumptionTips: {
      type: String,
    },
    Caution: {
      type: String,
    },
    inc: {
      type: String,
    },
    noOfViews: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// foodSchema.plugin(random, { path: "r" }); // by default `path` is `random`. It's used internally to store a random value on each doc.

module.exports = mongoose.model("FoodModel", foodSchema);
