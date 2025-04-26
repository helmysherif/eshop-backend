exports.sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});
