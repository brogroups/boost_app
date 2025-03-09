const DeliveryDebtModel = require("../models/deliveryDebt.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')

exports.createDeliveryDebt = async (req, res) => {
    try {
        const newDeliveryDebt = await DeliveryDebtModel.create(req.body)
        await deleteCache(`deliveryDebt`)
        return res.status(201).json({
            success: true,
            message: 'delivery debt created',
            deliveryDebt: newDeliveryDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDeliveryDebt = async (req, res) => {
    try {
        const cashe = await getCache(`deliveryDebt`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of delivery debts",
                deliveryDebts: cashe
            })
        }
        const deliveryDebts = await DeliveryDebtModel.find({}).populate("deliveryId").reverse()
        await setCache(`deliveryDebt`,deliveryDebts)
        return res.status(200).json({
            success: true,
            message: "list of delivery debts",
            deliveryDebts
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDeliveryDebtById = async (req, res) => {
    try {
        const deliveryDebt = await DeliveryDebtModel.findById(req.params.id).populate("deliveryId")
        if (!deliveryDebt) {
            return res.status(404).json({
                success: false,
                message: 'delivery debt not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'details of delivery debt',
            deliveryDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateDeliveryDebt = async (req, res) => {
    try {
        const deliveryDebt = await DeliveryDebtModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!deliveryDebt) {
            return res.status(404).json({
                success: false,
                message: 'delivery debt not found'
            })
        }
        await deleteCache(`deliveryDebt`)
        return res.status(200).json({
            success: true,
            message: 'delivery debt updated',
            deliveryDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteDeliveryDebt = async (req, res) => {
    try {
        const deliveryDebt = await DeliveryDebtModel.findByIdAndDelete(req.params.id)
        if (!deliveryDebt) {
            return res.status(404).json({
                success: false,
                message: 'delivery debt not found'
            })
        }
        await deleteCache(`deliveryDebt`)
        return res.status(200).json({
            success: true,
            message: 'delivery debt deleted',
            deliveryDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}