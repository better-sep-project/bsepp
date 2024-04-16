const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TocSubItemSchema = new Schema({
  subTitle: { type: String, required: false },
  href: { type: String, required: false },
});

const TocItemSchema = new Schema({
  title: { type: String, required: true },
  href: { type: String, required: true },
  subItems: [TocSubItemSchema],
});

const OtherInternetResourcesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  url: { type: String, required: true },
});

const RelatedEntrySchema = new Schema({
  relId: { type: String, required: false },
  relatedEntryTitle: { type: String, required: false },
  relEntryUrl: { type: String, required: false },
});

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
  otherInternetResources: [OtherInternetResourcesSchema],
  relatedEntries: [RelatedEntrySchema],
  meta: {
    scrapedAt: { type: Date, required: true },
    sourceUrl: { type: String, required: true },
  },
});

const EntryModel = mongoose.model("EntryModel", EntrySchema);
const TocItemModel = mongoose.model("TocItemModel", TocItemSchema);
const TocSubItemModel = mongoose.model("TocSubItemModel", TocSubItemSchema);
const OtherInternetResourcesModel = mongoose.model("OtherInternetResourcesModel", OtherInternetResourcesSchema);
const RelatedEntryModel = mongoose.model("RelatedEntryModel", RelatedEntrySchema);

module.exports = {
  EntryModel,
  TocItemModel,
  TocSubItemModel,
  OtherInternetResourcesModel,
  RelatedEntryModel,
};
