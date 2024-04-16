const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TocSubItemSchema = new Schema({
  subTitle: { type: String, required: false },
  href: { type: String, required: false },
});

module.exports = mongoose.model("TocSubItemModel", TocSubItemSchema);
