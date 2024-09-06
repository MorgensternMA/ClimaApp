import { createClient, SetOptions } from "redis";

const redisClient = createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
let connected = false;

export const Redis = {
  async set(key: string, value: any): Promise<void> {
    if (!connected) {
      await redisClient.connect();
      connected = true;
    }

    await redisClient.set(key, value, {} as SetOptions);
  },
  async get(key: string): Promise<any> {
    if (!connected) {
      await redisClient.connect();
      connected = true;
    }
    return await redisClient.get(key);
  },
  async increment(key: string): Promise<number> {
    if (!connected) {
      await redisClient.connect();
      connected = true;
    }

    const multi = redisClient.multi();
    multi.incr(key);
    multi.expire(key, 1);
    const response = await multi.exec(true);
    return response[0] as number;
  },
};
