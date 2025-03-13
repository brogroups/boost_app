const { default: mongoose } = require("mongoose")
const Debt1Model = require("../models/debt1.model")
const Debt2Model = require("../models/debt2.model")
const DeliveryDebtModel = require("../models/deliveryDebt.model")
const SellingBreadModel = require("../models/sellingBread.model")
const SellerModel = require("../models/seller.model")
const DeliveryModel = require("../models/delivery.model")
const ManagerModel = require("../models/manager.model")

exports.getStatics = async (req, res) => {
    try {
        switch (req.use.role) {
            case "superAdmin":

                let debt1s = await Debt1Model.find({}).populate("sellerId", 'username')
                let debt2s = await Debt2Model.find({}).populate("sellerId", 'username').populate('omborxonaProId', "name price")
                let deliveryDebt = await DeliveryDebtModel.find({}).populate("deliveryId", 'username')

                debt1s = debt1s.map((item) => {
                    return { ...item._doc, role: "seller" }
                })

                debt2s = debt2s.map((item) => {
                    return { ...item._doc, role: "seller" }
                })

                deliveryDebt = deliveryDebt.map((item) => {
                    return { ...item._doc, role: "delivery" }
                })

                let deliveryPrixod = await SellingBreadModel.find({}).populate("deliveryId", 'username').populate({
                    path: "typeOfBreadIds.breadId",
                    populate: {
                        path: "typeOfBreadId.breadId",
                        model: "TypeOfBread"
                    }
                }).populate("magazineId")
                deliveryPrixod = deliveryPrixod.map((item) => {
                    return { ...item._doc, price: item.typeOfBreadIds.reduce((a, b) => a + b?.breadId?.price, 0), quantity: item.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0) }
                })
                const pending = []
                for (const key of deliveryPrixod) {
                    let allPrice = key.typeOfBreadIds.reduce((a, b) => {
                        return a + b.breadId?.typeOfBreadId.reduce((a, b) => {
                            return a + b.breadId.price
                        }, 0)
                    }, 0) * key.quantity
                    if (allPrice - key.money >= 0) {
                        pending.push({ ...key })
                    }
                }

                const managers = await ManagerModel.find({})
                const mamangersStatics = []

                for (const item of managers) {
                    const sellers = await SellerModel.aggregate([
                        { $match: { superAdminId: new mongoose.Types.ObjectId(item._id) } }
                    ])

                    let debt = []
                    let managerPrixod = []
                    let managerPending = []
                    for (const seller of sellers) {
                        debt.push(await Debt1Model.aggregate([
                            { $match: { sellerId: seller._id } },
                            {
                                $lookup: {
                                    from: "sellers",
                                    localField: "sellerId",
                                    foreignField: "_id",
                                    as: "seller"
                                }
                            },
                            {
                                $unwind: "$seller"
                            },
                            {
                                $project: {
                                    title: 1,
                                    quantity: 1,
                                    sellerId: {
                                        _id: "$seller._id",
                                        username: "$seller.username"
                                    },
                                    reason: 1,
                                    price: 1,
                                    createdAt: 1,
                                }
                            }
                        ]))
                        debt.push(await Debt2Model.aggregate([
                            { $match: { sellerId: seller._id } },
                            {
                                $lookup: {
                                    from: "typeofwarehouses",
                                    localField: "omborxonaProId",
                                    foreignField: "_id",
                                    as: "omborxona"
                                }
                            },
                            {
                                $unwind: "$omborxona"
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
                                $unwind: "$seller"
                            },
                            {
                                $project: {
                                    _id: 1,
                                    quantity: 1,
                                    description: 1,
                                    omborxonaProId: {
                                        _id: "$omborxona._id",
                                        name: "$omborxona.name",
                                        price: "$omborxona.price",
                                    },
                                    seller: {
                                        _id: "$seller._id",
                                        username: "$seller.username"
                                    },
                                    createdAt: 1,
                                }
                            }
                        ]))
                        console.log((await SellingBreadModel.find({}).populate("typeOfBreadIds.breadId")).map((item) => item.typeOfBreadIds.map((i) => i.breadId)))
                        managerPrixod = await SellingBreadModel.aggregate([
                            {
                                $lookup: {
                                    from: "sellerbreads",
                                    localField: "typeOfBreadIds.breadId",
                                    foreignField: "_id",
                                    as: "breadDetails"
                                }
                            },
                            {
                                $unwind: "$breadDetails",
                            },
                            {
                                $match: {
                                    "breadDetails.sellerId": seller._id
                                }
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
                                    _id: 1,
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
                                    },
                                    paymentMethod: 1,
                                    delivertId: 1,
                                    magazineId: 1,
                                    money: 1,
                                    createdAt: 1
                                }
                            },
                        ])
                    }
                    for (const key of managerPrixod) {
                        let allPrice = key.typeOfBreadIds.reduce((a, b) => {
                            return a + b.breadId?.typeOfBreadId.reduce((a, b) => {
                                return a + b.breadId.price
                            }, 0)
                        }, 0) * key.quantity
                        if (allPrice - key.money >= 0) {
                            managerPending.push({ ...key })
                        }
                    }
                    debt = debt.filter((item) => item.length !== 0).flat(Infinity)

                    mamangersStatics.push({
                        _id: item._id,
                        username: item.username,
                        createdAt: item.createdAt,
                        debt: { totalPrice: debt.length > 0 ? debt.reduce((a, b) => a + (b.price ? b.price : b.omborxonaProId.price ? b.omborxonaProId.price : 0), 0) : 0, history: debt },
                        pending: {
                            totalPrice: managerPending.reduce((a, b) => a + (b.typeOfBreadIds.reduce((a, b) => a + b.breadId.typeOfBreadId.reduce((a, b) => a + b.breadId.price, 0), 0) * b.quantity - b.money), 0),
                            history: managerPending
                        },
                        prixod: {
                            totalPrice: managerPrixod.reduce((a, b) => a + b.money, 0),
                            history: managerPrixod
                        }
                    })
                }


                return res.status(200).json({
                    statics: {
                        debt: {
                            totalPrice: [...debt1s, ...debt2s, ...deliveryDebt].reduce((a, b) => a + (b.price ? b.price : b.omborxonaProId.price ? b.omborxonaProId.price : 0), 0),
                            history: [...debt1s, ...debt2s, ...deliveryDebt]
                        },
                        prixod: {
                            totalPrice: deliveryPrixod.reduce((a, b) => a + b.money, 0),
                            history: deliveryPrixod
                        },
                        pending: {
                            totalPrice: pending.reduce((a, b) => a + (b.typeOfBreadIds.reduce((a, b) => a + b.breadId.typeOfBreadId.reduce((a, b) => a + b.breadId.price, 0), 0) * b.quantity - b.money), 0),
                            history: pending
                        }
                    },
                    managerStatics: mamangersStatics.reverse()
                })
                break;

            default:
                break;
        }
    }
    catch (error) {
        console.error(error)
    }
}

// else if (req.use.role === "manager") {
//     const sellers = await SellerModel.aggregate([{ $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id) } }])
//     const deliveries = await DeliveryModel.aggregate([{ $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id) } }])
//     let AllDebt = []
//     let deliveryPrixod = []
//     const pending = []

//     for (const key of sellers) {
//         let debt1 = await Debt1Model.aggregate([
//             { $match: { sellerId: key?._id } }
//         ])

//         debt1.forEach((item) => {
//             AllDebt.push({ ...item, role: "seller" })
//         })

//         let debt2 = await Debt2Model.aggregate([
//             { $match: { sellerId: key?._id } }
//         ])
//         debt2.forEach((item) => {
//             AllDebt.push({ ...item, role: "seller" })
//         })
//     }
//     for (const key of deliveries) {
//         console.log(key);

//         let debt3 = await DeliveryDebtModel.aggregate([
//             { $match: { deliveryId: key?._id } }
//         ])
//         debt3.forEach((item) => {
//             AllDebt.push({ ...item, role: "delivery" })
//         })

//         let prixod = await SellingBreadModel.aggregate([
//             { $match: { deliveryId: key?._id } },
//             {
//                 $lookup: {
//                     from: "deliveries",
//                     localField: "deliveryId",
//                     foreignField: "_id",
//                     as: "delivery"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "typeofbreads",
//                     localField: "typeOfBreadIds",
//                     foreignField: "_id",
//                     as: "typeOfBreads"
//                 }
//             },
//             {
//                 $unwind: "$delivery"
//             },
//             {
//                 $project: {
//                     delivery: { username: 1 },
//                     typeOfBreadIds: 1,
//                     _id: 1,
//                     quantity: 1,
//                     paymentMethod: 1,
//                     money: 1,
//                     createdAt: 1,
//                     updateAt: 1
//                 }
//             }
//         ])

//         prixod.forEach((item) => {
//             deliveryPrixod.push({ ...item })
//         })
//     }

//     for (const key of deliveryPrixod) {
//         let allPrice = key.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * key.quantity
//         if (allPrice - key.money < 0) {
//             pending.push({ ...key._doc })
//         }
//     }




//     return res.status(200).json({
//         managerStatics: {
//             debt: {
//                 totalPrice: 0,
//                 history: AllDebt
//             },
//             prixod: {
//                 totalPrice: deliveryPrixod.reduce((a, b) => a + b.money, 0),
//                 history: deliveryPrixod
//             },
//             pending: {
//                 totalPrice: pending.reduce((a, b) => a + (b.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * b.quantity) + b.money, 0),
//                 history: pending
//             }
//         }
//     })
// }