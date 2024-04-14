const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  authors: [{ type: String, required: true }],
  title: { type: String, required: true },
  firstPublished: { type: Date, required: false },
  lastPublished: { type: Date, required: false },
  preamble: { type: String, required: false },
  bibliography: { type: String, required: false },
  subHeadings: [{
    subTitle: String,
    href: String,
    subItems: [{
      subTitle: String,
      href: String
    }]
  }],
  otherInternetResources: [{
    title: String,
    description: String,
    url: String
  }],
  relatedEntries: [{
    relId: String,
    relatedEntryTitle: String,
    relEntryUrl: String
  }]
});

entrySchema.index({ id: 1, title: 1 });

const Entry = mongoose.model('Entry', entrySchema);

module.exports = {
  Entry
};
