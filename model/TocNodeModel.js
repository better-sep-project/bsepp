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
  title: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TocNode", TocNodeSchema);
