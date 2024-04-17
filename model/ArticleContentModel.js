const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleContentSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: false,
  },
  title: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
    enum: ["heading", "subheading"],
  },
  children: [{
    contentType: {
      type: String,
      required: true,
      enum: ["text", "blockQuote"],
    },
    value: {
      type: String,
      required: true,
    },
  }],
});

module.exports = mongoose.model("ArticleContent", ArticleContentSchema);
