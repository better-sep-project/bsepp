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
    enum: ["heading", "subheading"],
  },
  children: [{ type: Schema.Types.ObjectId, ref: "ArticleChildren" }],
});

module.exports = mongoose.model("ArticleContent", ArticleContentSchema);
