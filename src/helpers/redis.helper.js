const redis = require("../configs/redis.config")

exports.setCache = async (key, value, ttl = 3600) => {
    try {
        const stringValue = JSON.stringify(value);
        await redis.set(key, stringValue, "EX", ttl);
    } catch (error) {
        console.error('Error setting cache:', error)
    }
}

exports.getCache = async (key) => {
    try {
        const cachedValue = await redis.get(key)
        return cachedValue ? JSON.parse(cachedValue) : null
    } catch (error) {
        console.error('Error getting cache:', error)
        return null
    }
}

exports.deleteCache = async (key) => {
    try {
        await redis.del(key)
    } catch (error) {
        console.error('Error deleting cache:', error)
    }
} 

exports.getAllCache = async () => {
    try{
        const keys = await redis.keys("*")
        let obj = {}
        
        for (const key of keys) {
            obj[key] = await this.getCache(key)
        }        
        return obj ? obj : null
    }
    catch (error) {
        console.error('Error get all cache:', error)
    }
}