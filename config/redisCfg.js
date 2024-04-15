const { createClient } = require("redis");
const RedisStore = require("connect-redis").default;

let redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
  ttl: process.env.SESSION_EXPIRY,
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.log(`Error: ${err}`);
});

redisClient.connect();

module.exports = {
  redisClient,
  redisStore,
};
