const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const SellerBreadModel = require("../models/sellerBread.model")


exports.createOrderWithDelivery = async (req, res) => {
    try {
        for (const key of req.body.typeOfBreadIds) {
            let typeOfWareHouse = await SellerBreadModel.findById(key.bread);
            if (!typeOfWareHouse) {
                return res.status(404).json({
                    success: false,
                    message: `Mahsulot topilmadi (ID: ${key.omborxonaProId})`
                });
            }

            if (key.quantity > typeOfWareHouse.totalQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.quantity}`
                });
            }

            typeOfWareHouse.totalQuantity -= key.quantity;
            await SellerBreadModel.findByIdAndUpdate(
                key.bread,
                { totalQuantity: typeOfWareHouse.totalQuantity },
                { new: true }
            );
        }
        switch (req.use.role) {
            case "manager":
                await OrderWithDeliveryModel.create({ ...req.body, adminId: new mongoose.Types.ObjectId(req.use.id) })
                break;
            case "superAdmin":
                await OrderWithDeliveryModel.create(req.body)
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Ruxsat yo'q"
                });
        }
        await deleteCache(`orderWithDelivery`)
        await deleteCache(`sellerBread`)
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
        await getCache(`orderWithDelivery`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of order with delivereis",
                orderWithDeliveries: cache?.reverse()
            })
        }
        let orderWithDeliveries = []

        switch (req.use.role) {
            case "superAdmin":
                orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("deliveryId", "username")
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item._doc, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.bread?.price, 0) }
                })
                break;

                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) }
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
                    // {
                    //     $lookup: {
                    //         from: "magazines",
                    //         localField: "magazineId",
                    //         foreignField: "_id",
                    //         as: "magazineDetails"
                    //     }
                    // },
                    // {
                    //     $unwind: "$magazineDetails",
                    // },
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
                            createdAt: 1,
                            typeOfBreadIds: {
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
                                        },
                                        quantity: '$$breadIdItem.quantity'
                                    }
                                }
                            }
                        }
                    }
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.breadId?.price, 0) }
                })
                break;
            case "delivery":
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) }
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

                            deliveryId: {
                                _id: "$deliveryDetails._id",
                                username: "$deliveryDetails.username"
                            },
                            createdAt: 1,
                            typeOfBreadIds: {
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
                                        },
                                        _id: "$breadDetails._id"
                                    }
                                }
                            }
                        }
                    }
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.breadId?.price, 0) }
                })
                break;
            case "manager":
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { adminId: new mongoose.Types.ObjectId(req.use.id) }
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
                            deliveryId: {
                                _id: "$deliveryDetails._id",
                                username: "$deliveryDetails.username"
                            },
                            createdAt: 1,
                            typeOfBreadIds: {
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
                                        },
                                        quantity: "$$breadIdItem.quantity",
                                        _id: "$breadDetails._id"
                                    }
                                }
                            },
                            totalQuantity: { $sum: "$typeOfBreadIds.quantity" }
                        }
                    },

                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b.breadId?.price, 0) }
                })
                break;
            default:
                break;
        }
        await setCache(`orderWithDelivery`, orderWithDeliveries)
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
        const orderWithDelivery = await OrderWithDeliveryModel.findById(req.params.id)
            .populate("typeOfBreadIds.bread typeOfBreadIds.bread.typeOfBreadId.breadId");

        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "Order with delivery not found"
            });
        }

        for (const key of orderWithDelivery.typeOfBreadIds) {
            let bread = await SellerBreadModel.findById(key.bread).populate("typeOfBreadId.breadId");
            bread.totalQuantity += key.quantity
            await SellerBreadModel.findByIdAndUpdate(
                bread?._id,
                { totalQuantity: bread?.totalQuantity },
                { new: true }
            );
        }

        await OrderWithDeliveryModel.findByIdAndDelete(req.params.id);

        await deleteCache(`orderWithDelivery`);

        return res.status(200).json({
            success: true,
            message: "Order with delivery deleted",
            orderWithDelivery
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
