const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleContentNodeSchema = new Schema({
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: "ArticleContentNode",
      default: [],
    },
  ],
  contentType: {
    type: String,
    required: true,
    enum: ["text", "blockQuote", "heading", "title"],
  },
  value: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("ArticleContentNode", ArticleContentNodeSchema);
