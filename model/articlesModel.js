const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  articleContent: [
    {
      type: Schema.Types.ObjectId,
      ref: "ArticleContent",
    },
  ],
});

module.exports = mongoose.model("Article", ArticleSchema);
