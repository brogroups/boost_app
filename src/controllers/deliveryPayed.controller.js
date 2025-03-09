const deliveryPayedModel = require("../models/deliveryPayed.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')

exports.createdeliveryPayed = async (req, res) => {
    try {
        const deliveryPayed = await deliveryPayedModel.create(req?.body)
        await deleteCache("deliveryPayed")
        await deleteCache("delivery")
        return res?.status(201)?.json({
            success: true,
            message: "delivery payed created",
            deliveryPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDeliveryPayed = async (req, res) => {
    try {
        const deliveryPayedsCache = await getCache("deliveryPayed")
        if (deliveryPayedsCache) {
            return res.status(200).json({
                success: true,
                message: 'list of seller payeds',
                deliveryPayeds: deliveryPayedsCache
            })
        }
        const deliveryPayeds = (await deliveryPayedModel.find({}).populate("deliveryId")).reverse()
        await setCache(`deliveryPayed`,deliveryPayeds)
        return res.status(200).json({
            success: true,
            message: 'list of seller payeds',
            deliveryPayeds
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getdeliveryPayedById = async (req, res) => {
    try {
        const deliveryPayed = await deliveryPayedModel.findById(req.params.id).populate("deliveryId")
        if (!deliveryPayed) {
            return res.status(404).json({
                success: false,
                message: "delivery payed not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of seller payed",
            deliveryPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updatedeliveryPayedById = async (req, res) => {
    try {
        const deliveryPayed = await deliveryPayedModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!deliveryPayed) {
            return res.status(404).json({
                success: false,
                message: "delivery payed not found"
            })
        }
        await deleteCache("deliveryPayed")
        await deleteCache("delivery")
        return res.status(200).json({
            success: true,
            message: "seller payed updated",
            deliveryPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deletedelivertPayed = async (req, res) => {
    try {
        const deliveryPayed = await deliveryPayedModel.findByIdAndDelete(req.params.id)
        if (!deliveryPayed) {
            return res.status(404).json({
                success: false,
                message: "delivery payed not found"
            })
        }
        await deleteCache("deliveryPayed")
        await deleteCache("delivery")
        return res.status(200).json({
            success: true,
            message: "seller payed deleted",
            deliveryPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}