const { Schema, model } = require("mongoose");
const DeliveryModel = require("./delivery.model");

const DeliveryPayedSchema = new Schema({
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    comment: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const DeliveryPayedModel = model("DeliveryPayed", DeliveryPayedSchema)
module.exports = DeliveryPayedModel