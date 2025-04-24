const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "order must belong to a user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "product" },
        quantity: { type: Number },
        color: { type: String },
        price: { type: Number },
      },
    ],
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalOrderPrice: { type: Number },
    paymentMethod: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    shippingAddress: {
      details: String,
      city: String,
      phone: String,
      postalCode: String,
    },
  },
  { timestamps: true }
);
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email profileImage phone",
  }).populate({
    path: "cartItems.product",
    select: "title price imageCover quantity sold",
  });
  next();
});
module.exports = mongoose.model("order", orderSchema);
