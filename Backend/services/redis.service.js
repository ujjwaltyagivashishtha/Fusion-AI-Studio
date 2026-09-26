import Redis from "ioredis";


const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});


redisClient.on("connect", ()=>{
  console.log("Redis is connected : ", process.env.REDIS_HOST);
});

redisClient.on("error", (error)=>{
  console.log("Redis error: ", error);
});

export default redisClient;