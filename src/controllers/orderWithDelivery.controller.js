const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")


exports.createOrderWithDelivery = async (req, res) => {
    try {
        const { typeOfBreadIds, quantity, description, sellerId, deliveryId, magazineId } = req.body
        let order = null
        switch (req.use.role) {
            case "superAdmin":
                order = await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    quantity,
                    description,
                    sellerId,
                    deliveryId,
                    magazineId
                })
                break;
            case "seller":
                order = await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    quantity,
                    description,
                    sellerId: new mongoose.Types.ObjectId(req.use.id),
                    deliveryId,
                    magazineId
                })
                break;

            default:
                break;
        }

        await deleteCache(`orderWithDelivery`)
        return res.status(201).json({
            success: true,
            message: "order with delivery created",
            order
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
        // await getCache(`orderWithDelisvery`)
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
                orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("sellerId", 'username').populate("deliveryId", "username").populate("magazineId", "title").populate("typeOfBreadIds.bread")
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item._doc, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.bread?.price, 0) }
                })
                break;
            case "seller":
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) }
                    },
                    {
                        $lookup: {
                            from: "sellers",
                            localField: "sellerId",
                            foreignField: "_id",
                            as: "seller"
                        }
                    },
                    {
                        $unwind: "$seller",
                    },
                    {
                        $lookup: {
                            from: "deliveries",
                            localField: "deliveryId",
                            foreignField: "_id",
                            as: "deliveryDetails"
                        }
                    },
                    {
                        $unwind: "$deliveryDetails",
                    },
                    {
                        $lookup: {
                            from: "sellerbreads",
                            localField: "typeOfBreadIds.bread",
                            foreignField: "_id",
                            as: "breadDetails"
                        }
                    },
                    {
                        $unwind: "$breadDetails",
                    },
                    {
                        $lookup: {
                            from: "magazines",
                            localField: "magazineId",
                            foreignField: "_id",
                            as: "magazineDetails"
                        }
                    },
                    {
                        $unwind: "$magazineDetails",
                    },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "breadDetails.typeOfBreadId.breadId",
                            foreignField: "_id",
                            as: "breadIdDetails"
                        }
                    },
                    {
                        $unwind: "$breadIdDetails",
                    },
                    {
                        $project: {
                            description: 1,
                            quantity: 1,
                            sellerId: {
                                _id: "$seller._id",
                                username: "$seller.username"
                            },
                            deliveryId: {
                                _id: "$deliveryDetails._id",
                                username: "$deliveryDetails.username"
                            },
                            magazineId: {
                                _id: "$magazineDetails._id",
                                title: "$magazineDetails.title"
                            },
                            createdAt: 1,
                            typeOfBreadIds: {
                                $map: {
                                    input: "$typeOfBreadIds",
                                    as: "breadItem",
                                    in: {
                                        bread: {
                                            _id: "$breadDetails._id",
                                            typeOfBreadId: {
                                                $map: {
                                                    input: "$breadDetails.typeOfBreadId",
                                                    as: "breadIdItem",
                                                    in: {
                                                        breadId: {
                                                            _id: "$breadIdDetails._id",
                                                            title: "$breadIdDetails.title",
                                                            price: "$breadIdDetails.price",
                                                            price2: "$breadIdDetails.price2",
                                                            price3: "$breadIdDetails.price3",
                                                            price4: "$breadIdDetails.price4",
                                                            createdAt: "$breadIdDetails.createdAt",
                                                        }
                                                    }
                                                }
                                            },
                                            createdAt: "$breadDetails.createdAt",
                                        },
                                        quantity: "$$breadItem.quantity"
                                    }
                                }
                            }
                        }
                    }
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.bread.price, 0) }
                })
                break;

            default:
                break;
        }
        await setCache(`orderWithDelivery`, orderWithDeliveries.reverse())
        return res.status(200).json({
            success: true,
            message: "list of order with delivereis",
            orderWithDeliveries: orderWithDeliveries.reverse()
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
        const orderWithDelivery = await OrderWithDeliveryModel.findById(req.params.id).populate("typeOfBreadIds sellerId deliveryId magazineId")
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
        const orderWithDelivery = await OrderWithDeliveryModel.findByIdAndUpdate(req.params.id, { typeOfBreadIds, quantity, description, sellerBreadId, time: time ? time : new Date(), updateAt: new Date() }, { new: true }).populate("typeOfBreadIds sellerId")
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