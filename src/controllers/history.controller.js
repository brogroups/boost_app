const { getAllCache, getCache } = require("../helpers/redis.helper")

exports.getAllHistory = async (req, res) => {
    try {
        const histories = await getAllCache()
        let obj = {}
        const date = new Date()
        const id = req.use
        

        for (const key of histories) {
            const data = await getCache(key)
            obj[key] = data.filter((item) => {
                const createdAt = new Date(item.createdAt)
                return (
                    date.getDate() === createdAt.getDate()
                )
            })
        }

        return res.status(200).json({
            success: true,
            message: "list of histories",
            histories: obj
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}