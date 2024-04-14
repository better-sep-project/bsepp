
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tocSubItemSchema = new Schema({
  subTitle: { type: String, required: false },
  href: { type: String, required: false }
});

const tocItemSchema = new Schema({
  title: { type: String, required: true },
  href: { type: String, required: true },
  subItems: [tocSubItemSchema]
});

const otherInternetResourcesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  url: { type: String, required: true }
});

const relatedEntrySchema = new Schema({
  relId: { type: String, required: false },
  relatedEntryTitle: { type: String, required: false },
  relEntryUrl: { type: String, required: false }
});

const entrySchema = new Schema({
  title: { type: String, required: true },
  authors: [{ type: Object, required: true }],
  dates: {
    firstPublished: { type: Date, required: false },
    lastUpdated: { type: Date, required: false }
  },
  preamble: { type: String, required: false },
  bibliography: { type: String, required: false },
  toc: [tocItemSchema],
  otherInternetResources: [otherInternetResourcesSchema],
  relatedEntries: [relatedEntrySchema],
  meta: {
    scrapedAt: { type: Date, required: true },
    sourceUrl: { type: String, required: true }
  }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = {
  Entry
};
