const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const SellerBreadModel = require("../models/sellerBread.model")
const TypeOfBreadModel = require("../models/typOfbread.model")


exports.createOrderWithDelivery = async (req, res) => {
    try {
        const { typeOfBreadIds, description, sellerId, deliveryId } = req.body
        let order = null
        switch (req.use.role) {
            case "superAdmin":
                order = await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    description,
                    sellerId,
                    deliveryId,
                })
                break;
            case "seller":
                for (const key of typeOfBreadIds) {
                    let bread = await SellerBreadModel.findById(key.bread).populate("typeOfBreadId.breadId");

                    if (!bread) {
                        return res.status(404).json({
                            success: false,
                            message: `Non topilmadi (ID: ${key.bread})`
                        });
                    }

                    let typeOfBreadIndex = bread.typeOfBreadId.findIndex(i => i.breadId._id.equals(key.typeOfBread));

                    if (typeOfBreadIndex === -1) {
                        return res.status(400).json({
                            success: false,
                            message: "Bunday mahsulot mavjud emas"
                        });
                    }

                    let selectedBread = bread.typeOfBreadId[typeOfBreadIndex];

                    if (key.quantity > selectedBread.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Yetarli non mavjud emas. Ombordagi miqdor: ${selectedBread.quantity}`
                        });
                    }

                    selectedBread.quantity -= key.quantity;
                    await SellerBreadModel.findByIdAndUpdate(
                        bread._id,
                        { typeOfBreadId: bread.typeOfBreadId },
                        { new: true }
                    );
                }
                order = await OrderWithDeliveryModel.create({
                    typeOfBreadIds,
                    description,
                    sellerId: new mongoose.Types.ObjectId(req.use.id),
                    deliveryId,
                });
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
        const cache = await getCache(`orderWithDelisvery`)
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
                orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("sellerId", 'username').populate("deliveryId", "username").populate("typeOfBreadIds.bread")
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
                            // magazineId: {
                            //     _id: "$magazineDetails._id",
                            //     title: "$magazineDetails.title"
                            // },
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
                    return { ...item, typeOfBreadIdss: item.typeOfBreadIds.map((item) => item.bread.typeOfBreadId).flat(Infinity) }
                })
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIdss.reduce((a, b) => a + b.breadId.price, 0) }
                })
                break;
            case "delivery":
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) }
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
                    return { ...item, typeOfBreadIdss: item.typeOfBreadIds.map((item) => item.bread.typeOfBreadId).flat(Infinity) }
                })
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIdss.reduce((a, b) => a + b.breadId.price, 0) }
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

            if (!bread) {
                return res.status(404).json({
                    success: false,
                    message: `Non topilmadi (ID: ${key.bread})`
                });
            }

            // **to‘g‘ri typeOfBreadId elementini topamiz**
            let typeOfBreadIndex = bread.typeOfBreadId.findIndex(i => i.breadId._id.equals(key.bread.typeOfBreadId[0].breadId._id));

            if (typeOfBreadIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Bunday mahsulot mavjud emas"
                });
            }

            let selectedBread = bread.typeOfBreadId[typeOfBreadIndex];

            // **O‘chirilgan buyurtmadagi non miqdorini yana qo‘shamiz**
            selectedBread.quantity += key.quantity;

            await SellerBreadModel.findByIdAndUpdate(
                bread._id,
                { typeOfBreadId: bread.typeOfBreadId },
                { new: true }
            );
        }

        // **Orderni bazadan o‘chiramiz**
        await OrderWithDeliveryModel.findByIdAndDelete(req.params.id);

        await deleteCache(`orderWithDelivery`);

        return res.status(200).json({
            success: true,
            message: "Order with delivery deleted and bread quantities restored",
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
