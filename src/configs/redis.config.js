const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-14662.c61.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 14662,
    password: "RbAWUIArxQUJhFp7fI2fXtFY5skVQiyCy",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis