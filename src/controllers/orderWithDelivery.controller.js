const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const SellerBreadModel = require("../models/sellerBread.model")
const ManagerWareModel = require("../models/managerWare.model")
const SellerModel = require("../models/seller.model")


exports.createOrderWithDelivery = async (req, res) => {
    try {
        if (req.body?.type !== "returned") {
            for (const key of req.body.typeOfBreadIds) {
                let typeOfWareHouse = await ManagerWareModel.findById(key.bread);
                if (!typeOfWareHouse) {
                    return res.status(404).json({
                        success: false,
                        message: `Mahsulot topilmadi (ID: ${key.omborxonaProId})`
                    });
                }

                if (key.quantity >= typeOfWareHouse.totalQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
                    });
                }

                let sellers = await SellerModel.aggregate([
                    { $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id), status: true } }
                ])

                for (const seller of sellers) {
                    let bread = await SellerBreadModel.findOne({ sellerId: seller._id, status: true, "typeOfBreadId.breadId": typeOfWareHouse.bread });
                    if (bread) {
                        bread.totalQuantity = (bread?.totalQuantity || 0) - (key.quantity || 1)
                        if (bread?.totalQuantity >= 0) {
                            await bread.save()
                            break;
                        } else {
                            await bread.save()
                        }
                    }
                }

                typeOfWareHouse.totalQuantity -= key.quantity;
                await ManagerWareModel.findByIdAndUpdate(
                    key.bread,
                    { totalQuantity: typeOfWareHouse.totalQuantity },
                    { new: true }
                );
            }
        }
        switch (req.use.role) {
            case "manager":
                await OrderWithDeliveryModel.create({ ...req.body, adminId: new mongoose.Types.ObjectId(req.use.id), totalQuantity: req.body?.type === "returned" ? req.body.totalQuantity : req.body.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0), totalQuantity2: req.body?.type === "returned" ? req.body.totalQuantity : req.body.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0) })
                break;
            case "superAdmin":
                await OrderWithDeliveryModel.create({ ...req.body, totalQuantity: req.body.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0), totalQuantity2: req.body.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0) })
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Ruxsat yo'q"
                });
        }
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
        let orderWithDeliveries = []

        switch (req.use.role) {
            case "superAdmin": {
                orderWithDeliveries = await OrderWithDeliveryModel.find({ status: true, totalQuantity: { $gt: 0 } }).populate("deliveryId", "username").lean()
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + b?.bread?.typeOfBreadId?.reduce((c, d) => c + (item.pricetype === 'tan' ? d.breadId.price : item.pricetype === 'narxi' ? d.breadId.price2 : item.pricetype === 'toyxona' ? d.breadId.price3 : 0) * (b.quantity || 1), 0), 0) }
                })
                break;
            }

            case "delivery": {
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: {
                            deliveryId: new mongoose.Types.ObjectId(req.use.id),
                            status: true,
                            totalQuantity: { $gt: 0 }
                        }
                    },
                    {
                        $lookup: {
                            from: "deliveries",
                            localField: "deliveryId",
                            foreignField: "_id",
                            as: "deliveryDetails"
                        }
                    },
                    { $unwind: "$deliveryDetails" },
                    {
                        $unwind: "$typeOfBreadIds"
                    },
                    {
                        $lookup: {
                            from: "managerwares",
                            localField: "typeOfBreadIds.bread",
                            foreignField: "_id",
                            as: "breadDetail"
                        }
                    },
                    { $unwind: { path: "$breadDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "breadDetail.bread",
                            foreignField: "_id",
                            as: "breadTypeDetail"
                        }
                    },
                    { $unwind: { path: "$breadTypeDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: "$_id",
                            adminId: { $first: "$adminId" },
                            deliveryId: { $first: {
                                username:"$deliveryDetails.username"
                            } },
                            description: { $first: "$description" },
                            pricetype: { $first: "$pricetype" },
                            totalQuantity: { $first: "$totalQuantity" },
                            totalQuantity2: { $first: "$totalQuantity2" },
                            createdAt: { $first: "$createdAt" },
                            typeOfBreadIds: {
                                $push: {
                                    breadId: "$typeOfBreadIds.bread",
                                    quantity: "$typeOfBreadIds.quantity",
                                    breadId: "$breadTypeDetail"
                                }
                            }
                        }
                    }
                    
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b?.breadId?.price : item.pricetype === 'dokon' ? b?.breadId?.price2 : item.pricetype === 'toyxona' ? b?.breadId?.price3 : b?.breadId?.price) * b.quantity, 0)}
                })

                // , price: (item.pricetype === 'tan' ? item?.typeOfBreadIds[0]?.breadId?.price : item.pricetype === 'dokon' ? item?.typeOfBreadIds[0]?.breadId?.price2 : item.pricetype === 'toyxona' ? item?.typeOfBreadIds[0]?.breadId?.price3 : 0)

                break;
            }
            case "manager": {
             
                orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
                    {
                        $match: {
                            adminId: new mongoose.Types.ObjectId(req.use.id),
                            status: true,
                            totalQuantity: { $gt: 0 }
                        }
                    },
                    {
                        $lookup: {
                            from: "deliveries",
                            localField: "deliveryId",
                            foreignField: "_id",
                            as: "deliveryDetails"
                        }
                    },
                    { $unwind: "$deliveryDetails" },
                    {
                        $unwind: "$typeOfBreadIds"
                    },
                    {
                        $lookup: {
                            from: "managerwares",
                            localField: "typeOfBreadIds.bread",
                            foreignField: "_id",
                            as: "breadDetail"
                        }
                    },
                    { $unwind: { path: "$breadDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "breadDetail.bread",
                            foreignField: "_id",
                            as: "breadTypeDetail"
                        }
                    },
                    { $unwind: { path: "$breadTypeDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: "$_id",
                            adminId: { $first: "$adminId" },
                            deliveryId: { $first: {
                                username:"$deliveryDetails.username"
                            } },
                            description: { $first: "$description" },
                            pricetype: { $first: "$pricetype" },
                            totalQuantity: { $first: "$totalQuantity" },
                            totalQuantity2: { $first: "$totalQuantity2" },
                            createdAt: { $first: "$createdAt" },
                            typeOfBreadIds: {
                                $push: {
                                    breadId: "$typeOfBreadIds.bread",
                                    quantity: "$typeOfBreadIds.quantity",
                                    breadId: "$breadTypeDetail"
                                }
                            }
                        }
                    }
                    
                ])
                orderWithDeliveries = orderWithDeliveries.map((item) => {
                    return { ...item, totalPrice: item.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b?.breadId?.price : item.pricetype === 'dokon' ? b?.breadId?.price2 : item?.pricetype === 'toyxona' ? b?.breadId?.price3 : 0) * (b.quantity || 1), 0)}
                })
                break;
            }
            default:
                break;
        }
        orderWithDeliveries = orderWithDeliveries.reduce((a, b) => {
            const excite = a.find(i => String(i._id) === String(b._id))
            if (!excite) {
                a.push({ ...b })
            }
            return a
        }, [])
        return res.status(200).json({
            success: true,
            message: "list of order with delivereis",
            orderWithDeliveries: orderWithDeliveries.reverse()
        })
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getOrderWithDeliveryById = async (req, res) => {
    try {
        const orderWithDelivery = await OrderWithDeliveryModel.findById(req.params.id).populate("typeOfBreadIds deliveryId")
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
        const orderWithDelivery = await OrderWithDeliveryModel.find(req.params.id)
        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        for (const key of typeOfBreadIds) {
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
                    message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
                });
            }

            typeOfWareHouse.totalQuantity += quantity;
            typeOfWareHouse.totalQuantity -= key.quantity;
            await SellerBreadModel.findByIdAndUpdate(
                key.bread,
                { totalQuantity: typeOfWareHouse.totalQuantity },
                { new: true }
            );
        }
        await OrderWithDeliveryModel.findByIdAndUpdate(orderWithDelivery._id, { typeOfBreadIds, quantity, description, sellerBreadId, time: time ? time : new Date(), updateAt: new Date(), totalQuantity: req.body.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0) }, { new: true })
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
        const orderWithDelivery = await OrderWithDeliveryModel.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
            .populate("typeOfBreadIds.bread typeOfBreadIds.bread.typeOfBreadId.breadId");

        if (!orderWithDelivery) {
            return res.status(404).json({
                success: false,
                message: "Order with delivery not found"
            });
        }


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
