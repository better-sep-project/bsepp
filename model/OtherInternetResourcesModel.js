const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OtherInternetResourcesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  url: { type: String, required: true },
});

module.exports = mongoose.model(
  "OtherInternetResourcesModel",
  OtherInternetResourcesSchema
);
