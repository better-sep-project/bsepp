const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const crypto = require("crypto");

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    unique: [true, "Email already exists"],
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
    select: false,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  salt: {
    type: String,
    select: false,
    default: () => crypto.randomBytes(16).toString("hex"),
  },

  // password reset
  currentResetToken: String,
  resetTokenExpires: Date,

  // user details
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "elevated"],
    default: "user",
  },
});

// hash password before saving
UserSchema.pre("save", function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  // Generate a new salt
  this.salt = crypto.randomBytes(16).toString("hex");

  // Hash the password with the new salt
  this.password = this.hashPassword(this.password);

  next();
});

UserSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update.password) return next();

  // Generate a new salt
  this._update.salt = crypto.randomBytes(16).toString("hex");

  // Hash the password with the new salt
  this._update.password = this.hashPassword(update.password);

  next();
});

// compare password
UserSchema.methods.comparePassword = function (password) {
  return this.password === this.hashPassword(password);
};

// generate password reset token
UserSchema.methods.generatePasswordReset = function () {
  this.currentResetToken = crypto.randomBytes(16).toString("hex");
  this.resetTokenExpires = Date.now() + 3600000; // 1 hour
};

// compare password reset token
UserSchema.methods.compareResetToken = function (token) {
  return token === this.currentResetToken;
};

// hash password
UserSchema.methods.hashPassword = function (password) {
  return crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, "sha512")
    .toString("hex");
};

// export
module.exports = mongoose.model("User", UserSchema);
