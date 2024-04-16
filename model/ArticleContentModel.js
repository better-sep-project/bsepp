const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleContentSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
    enum: ["text", "blockQuote"],
  },
  children: [{ type: Schema.Types.ObjectId, ref: "ArticleChildrenModel" }],
});

module.exports = mongoose.model("ArticleContentModel", ArticleContentSchema);
