const { createClient } = require("redis");
const RedisStore = require("connect-redis");

let redisClient = createClient(process.env.REDIS_URL);
let redisStore;

redisClient.on("connect", () => {
  console.log("Connected to Redis");
  redisStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
    ttl: process.env.SESSION_EXPIRY,
  });
});

redisClient.on("error", (err) => {
  console.log(`Error: ${err}`);
});

module.exports = {
  client: redisClient,
  store: redisStore,
};
