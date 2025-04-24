const { Schema, model } = require("mongoose");
const productModel = require("./product.model");
const reviewSchema = Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "min rating value is 1"],
      max: [5, "max rating value is 5"],
      required: [true, "review ratings are required"],
    },
    user: {
      type: Schema.ObjectId,
      ref: "user",
      required: [true, "review must belong to specific user"],
    },
    product: {
      type: Schema.ObjectId,
      ref: "product",
      required: [true, "review must belong to specific product"],
    },
  },
  { timestamps: true }
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name profileImage" });
  next();
});
// this function will be used to calculate the average ratings and quantity of reviews for a specific product
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    // stage 1: get all reviews for the product
    { $match: { product: productId } },
    // stage 2: group by product and calculate average ratings and quantity
    {
      $group: {
        _id: "$product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // stage 3: update the product with the new average ratings and quantity
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});
reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
  }
);
// reviewSchema.post("remove", async function () {
//   await this.constructor.calcAverageRatingsAndQuantity(this.product);
// });
const reviewModel = model("review", reviewSchema);
module.exports = reviewModel;
