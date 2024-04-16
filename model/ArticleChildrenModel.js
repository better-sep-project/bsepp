const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleChildrenSchema = new Schema({
  contentType: {
    type: String,
    required: true,
    enum: ["text", "blockQuote"],
  },
  value: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ArticleChildrenModel", ArticleChildrenSchema);
