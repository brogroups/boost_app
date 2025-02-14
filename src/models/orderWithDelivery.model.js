const { Schema, model } = require("mongoose");
const TypeOfBreadModel = require("./typOfbread.model");
const SellerBreadModel = require("./sellerBread.model");

const OrderWithDeliverySchema = new Schema({
    typeOfBreadId: { type: Schema.Types.ObjectId, ref: TypeOfBreadModel },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    sellerBreadId: { type: Schema.Types.ObjectId, ref: SellerBreadModel },
    time: { type: Date, required: true }
})

const OrderWithDeliveryModel = model("OrderWithDelivery",OrderWithDeliverySchema)
module.exports = OrderWithDeliveryModel