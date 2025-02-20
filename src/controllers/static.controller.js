const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")
const SellingBreadModel = require("../models/sellingBread.model")
const Debt2Model = require("../models/debt2.model")
const { default: mongoose } = require("mongoose")
 
exports.getStatics = async (req, res) => {
    try {
        const use = req.use
        if (use?.role === "seller") {

            let orderWithDeliveries = await OrderWithDeliveryModel.aggregate([{ $match: { sellerId: new mongoose.Types.ObjectId(use.id) } }])

            return res.status(200).json({
                success: true,
                message: "list of statics",
                statics: {
                    prixod: [...orderWithDeliveries],
                    rasxod: [],
                    panding: [],
                }
            })
        }
        else {
            let orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("typeOfBreadIds sellerId")
            let prixod = orderWithDeliveries.map((item) => {
                return { ...item._doc, price: item.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * item.quantity }
            })

            let sellingBreads = await SellingBreadModel.find({}).populate("typeOfBreadIds deliveryId")
            sellingBreads = sellingBreads.map((item) => {
                const price = item.typeOfBreadIds.reduce((a, b) => a + b.price, 0)
                return { ...item._doc, price: price * item.quantity }
            })

            let debt2s = await Debt2Model.find({}).populate("debtId sellerId")



            return res.status(200).json({
                success: true,
                message: "list of statics",
                statics: {
                    prixod: [...prixod, ...sellingBreads],
                    rasxod: debt2s,
                    panding: orderWithDeliveries,
                }
            })
        }

    }
    catch (error) {
        console.error(error)
    }
}