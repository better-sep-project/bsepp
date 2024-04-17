const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleAuthorModel = new Schema({
  article: {
    type: Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
});

module.exports = mongoose.model("ArticleAuthor", ArticleAuthorModel);
