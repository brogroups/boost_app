const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")


exports.createOrderWithDelivery = async (req, res) => {
    try {
        const { typeOfBreadIds, quantity, description, sellerId, deliveryId } = req.body
        switch (req.use.role) {
            case "superAdmin":
                await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    quantity,
                    description,
                    sellerId,
                    deliveryId
                })
                break;
            case "seller":
                await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    quantity,
                    description,
                    sellerId: req.use.id,
                    deliveryId
                })
                break;

            default:
                break;
        }

        await deleteCache(`orderWithDelivery`)
        return res.status(201).json({
            success: true,
            message: "order with delivery created",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getOrderWithDeliveries = async (req, res) => {
    try {
        const cache = null
        // await getCache(`orderWithDelivery`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of order with delivereis",
                orderWithDeliveries: cache
            })
        }
        let orderWithDeliveries = []
        switch (req.use.role) {
            case "superAdmin":
                orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("typeOfBreadIds").populate("deliveryId", 'username')
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item._doc, totalPrice: item.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * item.quantity }
                })
                break;
            case "seller":
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) }
                    },
                    {
                        $lookup: {
                            from: "deliveries",
                            localField: "deliveryId",
                            foreignField: "_id",
                            as: "delivery"
                        }
                    },
                    {
                        $unwind: "$delivery"
                    },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "typeOfBreadIds",
                            foreignField: "_id",
                            as: "breads"
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            quantity: 1,
                            description: 1,
                            delivery: {
                                _id: 1,
                                username: "$delivery.username"
                            },
                            breads: 1,
                            createdAt: 1,
                            updateAt: 1,
                        }
                    }
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.breads.reduce((a, b) => a + b.price, 0) * item.quantity }
                })
                break;
            default:
                break;
        }
        await setCache(`orderWithDelivery`, orderWithDeliveries)
        return res.status(200).json({
            success: true,
            message: "list of order with delivereis",
            orderWithDeliveries
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getOrderWithDeliveryById = async (req, res) => {
    try {
        const orderWithDelivery = await OrderWithDeliveryModel.findById(req.params.id).populate("typeOfBreadIds sellerId deliveryId")
        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of order with delivery",
            orderWithDelivery: { ...orderWithDelivery._doc, price: orderWithDelivery.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * orderWithDelivery.quantity }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateOrderWithDelivery = async (req, res) => {
    try {
        const { typeOfBreadIds, quantity, description, sellerBreadId, time } = req.body
        const orderWithDelivery = await OrderWithDeliveryModel.findByIdAndUpdate(req.params.id, { typeOfBreadIds, quantity, description, sellerBreadId, time: time ? time : new Date(), updateAt: new Date() }).populate("typeOfBreadIds sellerId")
        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        await deleteCache(`orderWithDelivery`)
        return res.status(200).json({
            success: true,
            message: "order with delivery updated",
            orderWithDelivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deleteOrderWithDelivery = async (req, res) => {
    try {
        const orderWithDelivery = await OrderWithDeliveryModel.findByIdAndDelete(req.params.id)
        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        await deleteCache(`orderWithDelivery`)
        return res.status(200).json({
            success: true,
            message: "order with delivery deleted",
            orderWithDelivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}