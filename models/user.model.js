const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "user name is required"],
  },
  slug: {
    type: String,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "user email is required"],
    unique: [true, "user email is unique"],
    lowercase: true,
  },
  phone: String,
  profileImage: String,
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "too short password"],
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "admin", "manager"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  passwordResetCode: String,
  passwordResetCodeExpired: Date,
  passwordResetCodeVerified: Boolean,
  wishList: [
    {
      type: Schema.ObjectId,
      ref: "product",
    },
  ],
  addresses: [
    {
      id: {
        type: Schema.Types.ObjectId,
      },
      alias: String,
      details: String,
      city: String,
      phone: String,
      postalCode: String,
    },
  ],
});
const setImageUrl = (doc) => {
  // return image baseUrl + image name
  if (doc.profileImage) {
    if (!doc.profileImage.startsWith(process.env.BASE_URL)) {
      const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
      doc.profileImage = imageUrl;
    }
  }
};
// findOne , findAll , update
userSchema.post("init", (doc) => {
  setImageUrl(doc);
});
// create
userSchema.post("save", (doc) => {
  setImageUrl(doc);
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const userModel = model("user", userSchema);
module.exports = userModel;
