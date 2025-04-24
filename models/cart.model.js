const mongoose = require("mongoose");
const cardSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
        color: { type: String },
        price: { type: Number },
      },
    ],
    totalCartPrice: { type: Number, default: 0 },
    totalPriceAfterDiscount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.ObjectId, ref: "user" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("cart", cardSchema);
