const { Schema, model } = require("mongoose");
const productSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "product name is required"],
      minlength: [3, "product name is too short"],
      maxlength: [100, "product name is too long"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: [true, "product description is required"],
      minlength: [20, "product description is too short"],
      maxlength: [2000, "product description is too short"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
      max: [200000, "product price is too long"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    images: [String],
    imageCover: {
      type: String,
      required: [true, "product image cover is required"],
    },
    category: {
      type: Schema.ObjectId,
      ref: "Category",
      required: [true, "product must be belong to a specific category"],
    },
    subCategories: [
      {
        type: Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: Schema.ObjectId,
      ref: "brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "rating must be greater than or equal 1"],
      max: [5, "rating must be less than of equal 5"],
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);
// mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate("category");
  this.populate("subCategories");
  this.populate("brand");
  next();
});
const setImageUrl = (doc) => {
  // return image baseUrl + image name
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imageList = [];
    doc.images.forEach((img) => {
      const imageUrl = `${process.env.BASE_URL}/products/${img}`;
      imageList.push(imageUrl);
    });
    doc.images = imageList;
  }
};
productSchema.virtual("reviews", {
  ref: "review",
  foreignField: "product",
  localField: "_id",
});
// findOne , findAll , update
productSchema.post("init", (doc) => {
  setImageUrl(doc);
});
// create
productSchema.post("save", (doc) => {
  setImageUrl(doc);
});
const productModel = model("product", productSchema);
module.exports = productModel;
