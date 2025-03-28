const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-17842.c245.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 17842,
    password: "cBP4vl1sv2I6BcsWfB3ckX1LNaR2Bos7",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis