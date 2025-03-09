// const { getAllCache, getCache } = require("../helpers/redis.helper")

const { default: mongoose } = require("mongoose")
const DeliveryDebtModel = require("../models/deliveryDebt.model")
const SellingBreadModel = require("../models/sellingBread.model")

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

                sellingbread = await SellingBreadModel.find({})
                break;
            case "delivery":
                debt = await DeliveryDebtModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } }
                ])

                sellingbread = await SellingBreadModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } }
                ])
                break;
            default:
                break;
        }

        return res.status(200).json({
            success: true,
            data: [...debt.map((item) => {
                return { ...item._doc ? item._doc : item, type: "debt" }
            }), ...sellingbread.map((item) => {
                return { ...item._doc ? item._doc : item, type: "selling shop" }
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