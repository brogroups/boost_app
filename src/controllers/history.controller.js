const {getAllCache} = require("../helpers/redis.helper")

exports.getAllHistory = async (req,res)=>{
    try{
    const histories = await getAllCache()
    
    return res.status(200).json({
        success:true,
        message:"list of histories",
        histories
    })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}