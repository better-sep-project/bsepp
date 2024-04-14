const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://scraper:lkzy4gYBy9KqsPvh@cluster0.augtsuf.mongodb.net/')
  .then(() => console.log('Connected to MongoDB with scraper.'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

module.exports = mongoose;
