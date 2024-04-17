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
  toc: [{ type: Schema.Types.ObjectId, ref: "TocItem" }],
  otherInternetResources: [
    {
      title: { type: String, required: true },
      description: { type: String, required: false },
      url: { type: String, required: true },
    },
  ],
  relatedEntries: [
    {
      relId: { type: String, required: false },
      relatedEntryTitle: { type: String, required: false },
      relEntryUrl: { type: String, required: false },
    },
  ],
  meta: {
    scrapedAt: { type: Date, required: true },
    sourceUrl: { type: String, required: true },
  },
  articleContent: [{ type: Schema.Types.ObjectId, ref: "ArticleContent" }],
});

module.exports = mongoose.model("Entry", EntrySchema);
