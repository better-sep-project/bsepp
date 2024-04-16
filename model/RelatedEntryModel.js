const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RelatedEntrySchema = new Schema({
  relId: { type: String, required: false },
  relatedEntryTitle: { type: String, required: false },
  relEntryUrl: { type: String, required: false },
});

module.exports = mongoose.model("RelatedEntry", RelatedEntrySchema);
