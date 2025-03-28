const { Schema, model } = require("mongoose");
const SellerModel = require("./seller.model");
const DeliveryModel = require("./delivery.model");
const SellerBreadModel = require("./sellerBread.model");
const OrderWithDeliveryModel = require("./orderWithDelivery.model");

const ReturnedProSchema = new Schema({
    orderWithDelivery: { type: Schema.Types.ObjectId, ref: OrderWithDeliveryModel, required: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    status: { type: Boolean, required: true, default: true }
})

const ReturnedProModel = model("ReturnedPro", ReturnedProSchema)
module.exports = ReturnedProModel