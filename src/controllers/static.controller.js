const Debt1Model = require("../models/debt1.model")
const Debt2Model = require("../models/debt2.model")
const DeliveryDebtModel = require("../models/deliveryDebt.model")
const SellingBreadModel = require("../models/sellingBread.model")

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

        let deliveryPrixod = await SellingBreadModel.find({}).populate("deliveryId", 'username').populate("typeOfBreadIds")
        const pending = []
        for (const key of deliveryPrixod) {
            let allPrice = key.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * key.quantity
            if (allPrice - key.money < 0) {
                pending.push({ ...key._doc })
            }
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
                    totalPrice: pending.reduce((a, b) => a + (b.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * b.quantity), 0) - pending.reduce((a, b) => a + b.money, 0),
                    history: pending
                }
            },
            managerStatics: {}
        })
    }
    catch (error) {
        console.error(error)
    }
}