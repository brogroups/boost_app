const Redis = require("ioredis")

const redis = new Redis({
    host: 'redis-12489.c62.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 12489,
    password: "QZfzDzZvNlQpiXFFaVfTg1ViWipJtUY8",
})

// redis-14457.c338.eu-west-2-1.ec2.redns.redis-cloud.com:14457

redis.on("connect", () => {
    console.log("redis is connected");
})

redis.on('error', () => {
    console.log('Redis Connection Error')
})



module.exports = redis