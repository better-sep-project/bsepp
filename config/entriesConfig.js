const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://scraper:lkzy4gYBy9KqsPvh@cluster0.augtsuf.mongodb.net/";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;
