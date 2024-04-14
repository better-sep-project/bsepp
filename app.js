require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { mongooseClient } = require("./config/db");
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const redisClient = require("./config/redis");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  store: new RedisStore({ client: redisClient.client }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// on server close
process.on("SIGINT", async () => {
  console.log("Closing server");

  // terminate db
  await mongooseClient.client.connection.close();

  // redis
  await redisClient.client.quit();

  process.exit(0);
});
