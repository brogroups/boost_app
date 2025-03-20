// const { getAllCache, getCache } = require("../helpers/redis.helper")

const { default: mongoose } = require("mongoose")
const DeliveryDebtModel = require("../models/deliveryDebt.model")
const SellingBreadModel = require("../models/sellingBread.model");
const SellerPayedModel = require("../models/sellerPayed.model");

// exports.getAllHistory = async (req, res) => {
//     try {
//         const histories = await getAllCache()
//          obj = {}
//         const date = new Date()

//         for (const key of histories) {
//             const data = await getCache(key)
//             obj[key] = data.filter((item) => {
//                 const createdAt = new Date(item.createdAt)
//                 return (
//                     date.getDate() === createdAt.getDate()
//                 )
//             })
//         }

//         return res.status(200).json({
//             success: true,
//             message: "list of histories",
//             histories: obj
//         })
//     }
//     catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// // exports.getSellerHistory = async (req, res) => {
// //     try {
// //         const SellerId = req.params.id
// //         let histories = await getAllCache()
// //         const sellerIncludeModels = ['sellerPayed']
// //         let datas = []
// //         const date = new Date()


// //         histories = histories.filter((item) => sellerIncludeModels.includes(item))

// //         for (const key of histories) {
// //             const data = await getCache(key)
// //             datas.push(data.filter((item) => {
// //                 const createdAt = new Date(item.createdAt)
// //                 return (
// //                     date.getDate() === createdAt.getDate() && item?.sellerId?._id === SellerId              )
// //             }))
// //         }


// //         return res.status(200).json({
// //             success: true,
// //             message: "list of seller's history",
// //             history: datas
// //         })
// //     }
// //     catch (error) {
// //         return res.status(500).json({
// //             success: false,
// //             message: error.message
// //         })
// //     }
// // }


exports.getDeliveryHistory = async (req, res) => {
    try {
        let debt;
        let sellingbread;
        switch (req.use.role) {
            case "superAdmin":
                debt = await DeliveryDebtModel.find({})

                sellingbread = await SellingBreadModel.find({}).populate("typeOfBreadIds.breadId")
                break;
            case "delivery":
                debt = await DeliveryDebtModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } }
                ])

                sellingbread = await SellingBreadModel.aggregate([
                    {
                        $match: {
                            deliveryId: new mongoose.Types.ObjectId(req.use.id)
                        }
                    },
                    {
                        $lookup: {
                            from: "orderwithdeliveries",
                            localField: "typeOfBreadIds.breadId",
                            foreignField: "_id",
                            as: "breadDetails"
                        }
                    },
                    {
                        $unwind: {
                            path: "$breadDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "sellerbreads",
                            localField: "breadDetails.typeOfBreadIds.bread",
                            foreignField: "_id",
                            as: "sellerBreadDetails"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sellerBreadDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "sellerBreadDetails.typeOfBreadId.breadId",
                            foreignField: "_id",
                            as: "breadIdDetails"
                        }
                    },
                    {
                        $unwind: {
                            path: "$breadIdDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            typeOfBreadIds: {
                                $map: {
                                    input: "$typeOfBreadIds",
                                    as: "breadItem",
                                    in: {
                                        breadId: {
                                            _id: "$breadItem._id",
                                            typeOfBreadId: {
                                                $map: {
                                                    input: "$sellerBreadDetails.typeOfBreadId",
                                                    as: "breadIdItem",
                                                    in: {
                                                        bread: {
                                                            _id: "$breadIdDetails._id",
                                                            title: "$breadIdDetails.title",
                                                            price: "$breadIdDetails.price",
                                                            price2: "$breadIdDetails.price2",
                                                            price3: "$breadIdDetails.price3",
                                                            price4: "$breadIdDetails.price4",
                                                            createdAt: "$breadIdDetails.createdAt"
                                                        }
                                                    }
                                                }
                                            },
                                            createdAt: "$sellerBreadDetails.createdAt"
                                        },
                                        quantity: "$$breadItem.quantity"
                                    }
                                }
                            },
                            paymentMethod: 1,
                            deliveryId: 1,
                            magazineId: 1,
                            money: 1,
                            createdAt: 1
                        }
                    }
                ]);


                break;
            default:
                break;
        }

        return res.status(200).json({
            success: true,
            data: [...debt.map((item) => {
                return { ...item._doc ? item._doc : item, type: "Chiqim" }
            }), ...sellingbread.map((item) => {
                return { ...item._doc ? item._doc : item, type: "sotilgan" }
            })]
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
                    _id: { createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, type: "$type",comment: "$comment" },
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