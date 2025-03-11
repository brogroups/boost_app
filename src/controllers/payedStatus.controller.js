const { setCache, getCache, deleteCache } = require("../helpers/redis.helper");
const payedStatusModel = require("../models/payedStatus.model");

exports.create = async (req, res) => {
    try {
        const sellerPayedStatus = await payedStatusModel.create(req.body)
        await deleteCache(`payedStatus`)
        return res.status(201).json({
            success: true,
            message: "seller payed status created",
            sellerPayedStatus
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findAll = async (req, res) => {
    try {
        const payedStatusesCache = await getCache(`payedStatus`)
        if (payedStatusesCache) {
            return res.status(200).json({
                success: true,
                message: "seller payed status created",
                payedStatus: payedStatusesCache?.reverse()
            })
        }
        const payedStatus = await payedStatusModel.find({})
        await setCache(`sellerPayedStatus`, payedStatus)
        return res.status(200).json({
            success: true,
            message: "seller payed status created",
            payedStatus:payedStatus.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findOne = async (req, res) => {
    try {
        const payedStatus = await payedStatusModel.findById(req.params.id)
        if (!payedStatus) {
            return res.status(404).json({
                success: false,
                message: "seller payed status not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "seller payed found",
            payedStatus
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.update = async (req, res) => {
    try {
        const payedStatus = await payedStatusModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!payedStatus) {
            return res.status(404).json({
                success: false,
                message: "seller payed status not found"
            })
        }
        await deleteCache(`payedStatus`)
        return res.status(200).json({
            success: true,
            message: "seller payed updated",
            payedStatus
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const payedStatus = await payedStatusModel.findByIdAndDelete(req.params.id)
        if (!payedStatus) {
            return res.status(404).json({
                success: false,
                message: "seller payed status not found"
            })
        }
        await deleteCache(`payedStatus`)
        return res.status(200).json({
            success: true,
            message: "seller payed deleted",
            payedStatus
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}