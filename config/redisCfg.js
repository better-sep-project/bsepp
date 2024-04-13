import { createClient } from "redis";

/**
 * Redis singleton.
 * Ensures no more than one connection to Redis is created.
 *
 * Wraps the get and set methods
 */
export class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      this.client = createClient(process.env.REDIS_URL);

      this.client.on("connect", () => {
        console.log("Connected to Redis");
      });

      this.client.on("error", (err) => {
        console.log(`Error: ${err}`);
      });

      RedisClient.instance = this;
    }

    return RedisClient.instance;
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
