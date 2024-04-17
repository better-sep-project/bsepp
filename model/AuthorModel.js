const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

AuthorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

AuthorSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// pre-hook to clean up the author name before saving
AuthorSchema.pre("save", function (next) {
  this.firstName = cleanName(this.firstName);
  this.lastName = cleanName(this.lastName);
  next();
});

function cleanName(name) {
  // trim, Capitalize, and remove non-alphabetical characters
  name = name.trim().replace(/[^a-zA-Z]/g, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// index composite key
AuthorSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

module.exports = mongoose.model("Author", AuthorSchema);
