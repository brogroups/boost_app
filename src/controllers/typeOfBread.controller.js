const TypeOfBreadModel = require("../models/typOfbread.model")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")


exports.createTypeOfBread = async (req, res) => {
    try {
        const newTypeOfBread = await TypeOfBreadModel.create(req.body)
        await deleteCache(`typeOfbread`)
        return res.status(201).json({
            success: true,
            message: "new type of bread created",
            typeOfBread: newTypeOfBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.getTypeOfBread = async (req, res) => {
    try {
        const cache =null
        // await getCache(`typeOfbread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of type of breads",
                typeOfBreads: req.use.role !== "superAdmin" ? cache?.reverse() : cache?.reverse()?.filter((i)=>{
                    return i.status === true
                })
            })
        }
        let typeOfBreads = await TypeOfBreadModel.find({})
        if (req.use.role !== "superAdmin") {
            typeOfBreads = typeOfBreads.filter((item) => {
                return item?.status === true
            })
        }
        await setCache(`typeOfbread`, typeOfBreads)
        return res.status(200).json({
            success: true,
            message: "list of type of breads",
            typeOfBreads: typeOfBreads.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getTypeOfBreadById = async (req, res) => {
    try {
        const typeOfBread = await TypeOfBreadModel.findById(req.params.id)
        if (!typeOfBread) {
            return res.status(404).json({
                success: false,
                message: "type of bread is not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of type of bread",
            typeOfBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateTypeOfBread = async (req, res) => {
    try {
        const typeOfBread = await TypeOfBreadModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!typeOfBread) {
            return res.status(404).json({
                success: false,
                message: "type of bread is not found"
            })
        }
        await deleteCache(`typeOfbread`)
        return res.status(200).json({
            success: true,
            message: "type of bread updated",
            typeOfBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteTypeOfBread = async (req, res) => {
    try {
        const typeOfBread = await TypeOfBreadModel.findByIdAndDelete(req.params.id)
        if (!typeOfBread) {
            return res.status(404).json({
                success: false,
                message: "type of bread is not found"
            })
        }
        await deleteCache(`typeOfbread`)
        return res.status(200).json({
            success: true,
            message: "type of bread deleted",
            typeOfBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}