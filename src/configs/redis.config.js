const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-11559.c265.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 11559,
    password: "c0qMlSXfNngblPyhKTVUKEzgyp4Dobed",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis