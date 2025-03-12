const DeliveryDebtModel = require("../models/deliveryDebt.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper');
const { default: mongoose } = require("mongoose");

exports.createDeliveryDebt = async (req, res) => {
    try {
        let newDeliveryDebt;
        switch (req.use.role) {
            case "superAdmin":
                newDeliveryDebt = await DeliveryDebtModel.create(req.body)
                break;
            case "delivery":
                newDeliveryDebt = await DeliveryDebtModel.create({ ...req.body, deliveryId: req.use.id })
                break;
            default:
                break;
        }
        await deleteCache(`deliveryDebt`)
        await deleteCache(`debt2`)
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
                deliveryDebts: cashe?.reverse()
            })
        }
        let deliveryDebts;

        switch (req.use.role) {
            case "superAdmin":
                deliveryDebts = await DeliveryDebtModel.find({})
                break;
            case "delivery":
                deliveryDebts = await DeliveryDebtModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } },
                ])
                break;
            default:
                break;
        }

        await setCache(`deliveryDebt`, deliveryDebts)
        return res.status(200).json({
            success: true,
            message: "list of delivery debts",
            deliveryDebts: deliveryDebts.reverse()
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
        await deleteCache(`debt2`)
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
        await deleteCache(`debt2`)
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