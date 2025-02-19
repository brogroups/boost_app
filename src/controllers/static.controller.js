const OrderWithDeliveryModel = require("../models/orderWithDelivery.model")

exports.getStatics = async (req, res) => {
    try {
        let orderWithDeliveries = await OrderWithDeliveryModel.find({}).populate("typeOfBreadIds sellerBreadId")
        orderWithDeliveries = orderWithDeliveries.map((item) => {
            return { ...item._doc, price: item.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * item.quantity }
        })
        console.log(orderWithDeliveries);
        
        return res.status(200).json({
            success: true,
            message: "list of statics",
            statics: {
                prixod:[],
                rasxod:[],
                panding:[],
            }        
        })
    }
    catch (error) {
        console.error(error)
    }
}