const { mongooseClient } = require("../config/db");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

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
});

// hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = crypto
    .pbkdf2Sync(this.password, this.salt, 10000, 64, "sha512")
    .toString("hex");

  next();
});

// compare password
UserSchema.methods.comparePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, "sha512")
    .toString("hex");

  return this.password === hash;
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

// export
module.exports = mongooseClient.client.model("User", UserSchema);
