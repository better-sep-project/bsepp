const mongoose = require("mongoose");

// mongoose singleton
class MongooseClient {
  constructor() {
    if (!MongooseClient.instance) {
      this.client = mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.client.then(() => {
        console.log("Connected to MongoDB");
      });

      this.client.catch((err) => {
        console.log(`Error: ${err}`);
      });

      MongooseClient.instance = this;
    }

    return MongooseClient.instance;
  }
}

const mongooseClient = new MongooseClient();

module.exports = mongooseClient;
