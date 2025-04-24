const mongoose = require("mongoose");
const couponSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"],
      unique: true,
      trim: true,
    },
    expire: {
      type: Date,
      required: [true, "coupon expire date is required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount is required"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("coupon", couponSchema);
