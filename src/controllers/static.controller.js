const Debt1Model = require("../models/debt1.model")
const Debt2Model = require("../models/debt2.model")
const DeliveryDebtModel = require("../models/deliveryDebt.model")

exports.getStatics = async (req, res) => {
    try {
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

        return res.status(200).json({
            statics: [...debt1s, ...debt2s, ...deliveryDebt],
            managerStatics: {}
        })
    }
    catch (error) {
        console.error(error)
    }
}