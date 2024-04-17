const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TocItemSchema = new Schema({
  title: { type: String, required: true },
  href: { type: String, required: true },
  subItems: [{
    subTitle: { type: String, required: false },
    href: { type: String, required: false },
  }],
});

module.exports = mongoose.model("TocItem", TocItemSchema);
