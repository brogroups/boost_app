const Debt1Model = require("../models/debt1.model")
const Debt2Model = require("../models/debt2.model")
const DeliveryDebtModel = require("../models/deliveryDebt.model")

exports.getStatics = async (req, res) => {
    try {
        const debt1s = await Debt1Model.find({}).populate("sellerId")
        const debt2s = await Debt2Model.find({}).populate("sellerId")
        const deliveryDebt = await DeliveryDebtModel.find({}).populate("deliveryId")
        return res.status(200).json({
            statics: [...debt1s, ...debt2s, ...deliveryDebt],
            managerStatics: {}
        })
    }
    catch (error) {
        console.error(error)
    }
}