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
    select: false,
  },
  identifier: {
    type: String,
    required: false,
  },
});

var autoPopulateChildren = function (next) {
  this.populate("children");
  next();
};

ArticleContentNodeSchema.pre("findOne", autoPopulateChildren).pre(
  "find",
  autoPopulateChildren
);

ArticleContentNodeSchema.pre("save", function (next) {
  if (this.contentType === "heading" || this.contentType === "title") {
    // autogen identifier from value
    this.identifier = this.value
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

module.exports = mongoose.model("ArticleContentNode", ArticleContentNodeSchema);
