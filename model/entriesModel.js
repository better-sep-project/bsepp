const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  title: { type: String, required: true },
  authors: [{ type: Object, required: true }],
  dates: {
    firstPublished: { type: Date, required: false },
    lastUpdated: { type: Date, required: false },
  },
  preamble: { type: String, required: false },
  bibliography: { type: String, required: false },
  toc: [TocItemSchema],
  otherInternetResources: [
    { type: Schema.Types.ObjectId, ref: "OtherInternetResourcesModel" },
  ],
  relatedEntries: [{ type: Schema.Types.ObjectId, ref: "RelatedEntryModel" }],
  meta: {
    scrapedAt: { type: Date, required: true },
    sourceUrl: { type: String, required: true },
  },
});

module.exports = mongoose.model("EntryModel", EntrySchema);
