const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleContentSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: false,
    },
    title: {
      type: String,
      required: true,
    },
    child: {
      type: Schema.Types.ObjectId,
      ref: "ArticleContentNode",
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

var autoPopulateChildren = function (next) {
  this.populate("child");
  next();
};

ArticleContentSchema.pre("findOne", autoPopulateChildren).pre(
  "find",
  autoPopulateChildren
);

module.exports = mongoose.model("ArticleContent", ArticleContentSchema);
