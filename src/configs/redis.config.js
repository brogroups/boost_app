const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-10796.c273.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 10796,
    password: "x57vospwbJexJUIsxUN5BvXLVrnmBaPf",
    // host: 'redis-14180.c267.us-east-1-4.ec2.redns.redis-cloud.com',
    // port: 14180,
    // password: "Q02P20co7KY6RL6QM19gcDMlXa5nwBj7",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis