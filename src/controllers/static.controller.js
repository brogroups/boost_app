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
        if (req.use.role === "superAdmin") {

            let debt1s = await Debt1Model.find({}).populate("sellerId", 'username')
            let debt2s = await Debt2Model.find({}).populate("sellerId", 'username')
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

            let deliveryPrixod = await SellingBreadModel.find({}).populate("deliveryId", 'username').populate("typeOfBreadIds")
            const pending = []
            for (const key of deliveryPrixod) {
                let allPrice = key.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * key.quantity
                if (allPrice - key.money < 0) {
                    pending.push({ ...key._doc })
                }
            }

            const managers = await ManagerModel.find({})
            const Debtmanagers = []

            for (const item of managers) {
                const sellers = await SellerModel.aggregate([
                    { $match: { superAdminId: new mongoose.Types.ObjectId(item._id) } }
                ])

                let debt = []
                for (const seller of sellers) {
                    debt.push(await Debt1Model.aggregate([
                        { $match: { sellerId: seller._id } }
                    ]))
                    debt.push(await Debt2Model.aggregate([
                        { $match: { sellerId: seller._id } }
                    ]))
                }
                Debtmanagers.push({ _id: item._id, username: item.username, createdAt: item.createdAt, debt: debt.filter((item) => item.length !== 0) })
            }

            return res.status(200).json({
                statics: {
                    debt: {
                        totalPrice: 0,
                        history: [...debt1s, ...debt2s, ...deliveryDebt]
                    },
                    prixod: {
                        totalPrice: deliveryPrixod.reduce((a, b) => a + b.money, 0),
                        history: deliveryPrixod
                    },
                    pending: {
                        totalPrice: pending.reduce((a, b) => a + (b.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * b.quantity) + b.money, 0),
                        history: pending
                    }
                },
                managerStatics: Debtmanagers
            })
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