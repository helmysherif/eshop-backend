const { Schema, model } = require("mongoose");
const subCategorySchema = Schema(
  {
    name: {
      type: String,
      required: [true, "subCategory name is required"],
      unique: [true, "subCategory name must be unique"],
      minlength: [2, "subCategory name is too short"],
      maxlength: [32, "subCategory name is too long"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: Schema.ObjectId,
      ref: "Category",
      required: [true, "subCategory must belong to a specific category"],
    },
  },
  { timestamps: true }
);
// mongoose query middleware
subCategorySchema.pre(/^find/, function (next) {
  this.populate("category");
  next();
});
const subCategoryModel = model("subCategory", subCategorySchema);
module.exports = subCategoryModel;
