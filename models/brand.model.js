const { Schema, model } = require("mongoose");
const brandSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "brand name is required"],
      unique: [true, "brand name must be unique"],
      minlength: [2, "brand name is too short"],
      maxlength: [32, "brand name is too long"],
      trim: true,
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
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne , findAll , update
brandSchema.post("init", (doc) => {
  setImageUrl(doc);
});
// create
brandSchema.post("save", (doc) => {
  setImageUrl(doc);
});
const brandModel = model("brand", brandSchema);
module.exports = brandModel;
