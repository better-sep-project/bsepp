const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  identifier: { type: String, required: true },
  title: { type: String, required: true },
  authors: [{ type: Object, required: true }],
  dates: {
    firstPublished: { type: Date, required: false },
    lastUpdated: { type: Date, required: false },
  },
  preamble: { type: String, required: false },
  bibliography: { type: String, required: false },
  toc: [{type: Schema.Types.ObjectId, ref: "TocItem"}],
  otherInternetResources: [
    { type: Schema.Types.ObjectId, ref: "OtherInternetResources" },
  ],
  relatedEntries: [{ type: Schema.Types.ObjectId, ref: "RelatedEntry" }],
  meta: {
    scrapedAt: { type: Date, required: true },
    sourceUrl: { type: String, required: true },
  },
});

module.exports = mongoose.model("Entry", EntrySchema);
