const CreateMagazineModel = require("../models/createMagazine.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')

exports.createCreateMagazine = async (req, res) => {
    try {
        const createMagazine = await CreateMagazineModel.create(req.body)
        await deleteCache(`createmagazine`)
        return res.status(200).json({
            success: true,
            message: "create magazine created",
            createMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getCreateMagazine = async (req, res) => {
    try {
        const cashe = await getCache(`createmagazine`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of create magazines",
                createMagazines
            })
        }
        const createMagazines = (await CreateMagazineModel.find({}).populate("DeliveryId"))
        await setCache(`createMagazine`, createMagazines.reverse())
        return res.status(200).json({
            success: true,
            message: "list of create magazines",
            createMagazines:createMagazines.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getCreateMagazineById = async (req, res) => {
    try {
        const createMagazine = await CreateMagazineModel.findById(req.params.id).populate("DeliveryId")
        if (!createMagazine) {
            return res.status(404).json({
                success: false,
                message: "create magazine not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of create magazine",
            createMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateCreateMagazine = async (req, res) => {
    try {
        const createMagazine = await CreateMagazineModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!createMagazine) {
            return res.status(404).json({
                success: false,
                message: "create magazine not found"
            })
        }
        await deleteCache(`createmagazine`)
        return res.status(200).json({
            success: true,
            message: "create magazine updated",
            createMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteCreateMagazine = async (req, res) => {
    try {
        const createMagazine = await CreateMagazineModel.findByIdAndDelete(req.params.id)
        if (!createMagazine) {
            return res.status(404).json({
                success: false,
                message: "create magazine not found"
            })
        }
        await deleteCache(`createmagazine`)
        return res.status(200).json({
            success: true,
            message: "create magazine deleted",
            createMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}