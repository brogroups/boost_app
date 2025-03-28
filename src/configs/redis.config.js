const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-13744.c246.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 13744,
    password: "f6MP6t5DcjqwFc4JUx8Q4A8fn8dVen0N",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis