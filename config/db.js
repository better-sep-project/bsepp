const mongoose = require("mongoose");

// mongoose singleton
class MongooseClient {
  constructor() {
    if (!MongooseClient.instance) {
      const base =
        process.env.MONGO_URL +
        (process.env.ENV === "production" ? "bsepp-core" : "test");

      console.log(`Connecting to MongoDB at ${base}`);

      this.connectionPromise = new Promise((resolve, reject) => {
        this.client = mongoose.connect(base, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        this.client.then(() => {
          console.log("Connected to MongoDB");
          resolve();
        }).catch((err) => {
          console.log(`Error: ${err}`);
          reject(err);
        });
      });

      MongooseClient.instance = this;
    }

    return MongooseClient.instance;
  }
}

const mongooseClient = new MongooseClient();

module.exports = mongooseClient;
