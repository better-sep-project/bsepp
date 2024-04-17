const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TocNodeSchema = new Schema({
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: "TocNode",
      default: [],
    },
  ],
  node: {
    type: String,
    ref: "ArticleContentNode",
    required: true,
  },
});

var autoPopulateChildren = function (next) {
  this.populate("children");
  next();
};

TocNodeSchema.pre("findOne", autoPopulateChildren).pre(
  "find",
  autoPopulateChildren
);

module.exports = mongoose.model("TocNode", TocNodeSchema);
