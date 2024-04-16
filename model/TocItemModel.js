const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TocItemSchema = new Schema({
  title: { type: String, required: true },
  href: { type: String, required: true },
  subItems: [{ type: Schema.Types.ObjectId, ref: "TocSubItemModel" }],
});

module.exports = mongoose.model("TocItemModel", TocItemSchema);
