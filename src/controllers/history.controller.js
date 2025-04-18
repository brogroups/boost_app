
const { default: mongoose } = require("mongoose")
const DeliveryDebtModel = require("../models/deliveryDebt.model")
const SellingBreadModel = require("../models/sellingBread.model");
const SellerPayedModel = require("../models/sellerPayed.model");


exports.getDeliveryHistory = async (req, res) => {
    try {
        let debt;
        let sellingbread;
        switch (req.use.role) {
            case "superAdmin":
                debt = await DeliveryDebtModel.find({}).lean()

                sellingbread = await SellingBreadModel.find({}).populate("typeOfBreadIds.breadId").lean()
                break;
            case "delivery":
                debt = await DeliveryDebtModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } }
                ])

                sellingbread = await SellingBreadModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id), status: true } },
                    {
                        $lookup: {
                            from: "managerwares",
                            localField: "breadId",
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
                            localField: "breadDetails.bread",
                            foreignField: "_id",
                            as: "breadIdDetails"
                        }
                    },
                    {
                        $unwind: "$breadIdDetails",
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
                            from: "magazines",
                            localField: "magazineId",
                            foreignField: "_id",
                            as: "magazine"
                        }
                    },
                    {
                        $unwind: "$magazine"
                    },
                    {
                        $project: {
                            _id: 1,
                            breadId: {
                                _id: "$breadIdDetails._id",
                                title: "$breadIdDetails.title",
                                price: "$breadIdDetails.price",
                                price2: "$breadIdDetails.price2",
                                price3: "$breadIdDetails.price3",
                                price4: "$breadIdDetails.price4",
                                createdAt: "$breadIdDetails.createdAt",
                            },
                            paymentMethod: 1,
                            deliveryId: {
                                _id: "$delivery._id",
                                username: "$delivery.username"
                            },
                            magazineId: 1,
                            money: 1,
                            pricetype: 1,
                            createdAt: 1,
                            quantity: 1,
                            magazineId: {
                                _id: "$magazine._id",
                                title: "$magazine.title"
                            },
                        }
                    },
                ])

                let soldBread1 = await SellingBreadModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id), status: true } },
                    {
                        $lookup: {
                            from: "orderwithdeliveries",
                            localField: "breadId",
                            foreignField: "_id",
                            as: "breadIdd"
                        }
                    },
                    { $unwind: "$breadIdd" },
                    { $unwind: "$breadIdd.typeOfBreadIds" }, // Har bir bread uchun alohida document
                    {
                        $lookup: {
                            from: "managerwares",
                            localField: "breadIdd.typeOfBreadIds.bread",
                            foreignField: "_id",
                            as: "breadDetails"
                        }
                    },
                    { $unwind: "$breadDetails" },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "breadDetails.bread",
                            foreignField: "_id",
                            as: "breadIdDetails"
                        }
                    },
                    { $unwind: "$breadIdDetails" },
                    {
                        $lookup: {
                            from: "deliveries",
                            localField: "deliveryId",
                            foreignField: "_id",
                            as: "delivery"
                        }
                    },
                    { $unwind: "$delivery" },
                    {
                        $lookup: {
                            from: "magazines",
                            localField: "magazineId",
                            foreignField: "_id",
                            as: "magazine"
                        }
                    },
                    {
                        $unwind: "$magazine"
                    },
                    {
                        $group: {
                            _id: "$_id",
                            bread: { $first: "$bread" },
                            paymentMethod: { $first: "$paymentMethod" },
                            deliveryId: { $first: { _id: "$delivery._id", username: "$delivery.username" } },
                            magazineId: { $first: { _id: "$magazine._id", title: "$magazine.title" } },
                            quantity: { $first: "$quantity" },
                            money: { $first: "$money" },
                            pricetype: { $first: "$pricetype" },
                            createdAt: { $first: "$createdAt" },
                            typeOfBreadIds: {
                                $push: {
                                    breadId: {
                                        _id: "$breadIdDetails._id",
                                        title: "$breadIdDetails.title",
                                        price: "$breadIdDetails.price",
                                        price2: "$breadIdDetails.price2",
                                        price3: "$breadIdDetails.price3",
                                        price4: "$breadIdDetails.price4",
                                        createdAt: "$breadIdDetails.createdAt",
                                    },
                                    quantity: "$breadIdd.typeOfBreadIds.quantity"
                                }
                            }
                        }
                    }
                ])

                sellingbread = [...sellingbread.map((item) => {
                    let totalPrice = (item.pricetype === 'tan' ? item?.breadId?.price : item.pricetype === 'dokon' ? item?.breadId?.price2 : item.pricetype === 'toyxona' ? item?.breadId?.price3 : 0) * item.quantity
                    let pending = totalPrice - item.money
                    return { ...item, totalPrice, pending, price: (item.pricetype === 'tan' ? item?.breadId?.price : item.pricetype === 'dokon' ? item?.breadId?.price2 : item.pricetype === 'toyxona' ? item?.breadId?.price3 : 0) }
                }), ...soldBread1.map((item) => {
                    const breadId = item.typeOfBreadIds.find((i) => String(i.breadId._id) === String(item.bread))?.breadId
                    let totalPrice = (item.pricetype === 'tan' ? breadId?.price : item.pricetype === 'dokon' ? breadId?.price2 : item.pricetype === 'toyxona' ? breadId?.price3 : breadId.price) * item.quantity
                    let pending = totalPrice - item.money
                    return { ...item, totalPrice, pending,breadId }
                })].map((i) => {
                    return { ...i, type: "sotilgan" }
                })


                break;
            default:
                break;
        }

        return res.status(200).json({
            success: true,
            data: [...debt.map((item) => {
                return { ...item ? item : item, type: "Chiqim" }
            }), ...sellingbread]
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellerHistory = async (req, res) => {
    try {
        const today = new Date();

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        let sellerHistory = await SellerPayedModel.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(req.use.id),
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $lookup: {
                    from: "sellers",
                    localField: "sellerId",
                    foreignField: "_id",
                    as: "seller"
                }
            },
            { $unwind: "$seller" },
            {
                $group: {
                    _id: { createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, type: "$type", comment: "$comment" },
                    price: { $sum: "$price" },
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: "$_id.createdAt",
                    type: "$_id.type",
                    price: "$price",
                    comment: "$_id.comment",
                }
            },
            { $sort: { createdAt: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            message: "list of history",
            history: sellerHistory
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}