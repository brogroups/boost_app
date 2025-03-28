const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-18020.c278.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 18020,
    password: "oCiVU5vygFUUdYcTAwABLYz9KgcG2Htb",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis