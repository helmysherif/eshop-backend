const mongoose = require("mongoose");
const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Category name is too short"],
      maxlength: [40, "Category name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);
const setImageUrl = (doc) => {
  // return image baseUrl + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne , findAll , update
categorySchema.post("init", (doc) => {
  setImageUrl(doc);
});
// create
categorySchema.post("save", (doc) => {
  setImageUrl(doc);
});
const CategoryModel = mongoose.model("Category", categorySchema);
module.exports = CategoryModel;
