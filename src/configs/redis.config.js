const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-15008.c14.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 15008,
    password: "4B8YcoezQMtkWZrSxUIpYFoKv7C8AlUm",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis