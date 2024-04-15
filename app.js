require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const mongooseClient = require("./config/db");
const session = require("express-session");
const { redisStore } = require("./config/redisCfg");

const v1Route = require("./routes/v1Route");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(bodyParser.json());

app.use("/api", v1Route);

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
