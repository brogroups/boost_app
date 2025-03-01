const { Schema, model } = require("mongoose");
const DeliveryModel = require("./delivery.model");
const PayedStatusModel = require("./payedStatus.model")
const PayedTypeModel = require("./typeOfPayed.model")

const DeliveryPayedSchema = new Schema({
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    price: { type: Number, required: true },
    statusId: { type: Schema.Types.ObjectId, ref: PayedStatusModel, required: true },
    typeId: { type: Schema.Types.ObjectId, ref: PayedTypeModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const DeliveryPayedModel = model("DeliveryPayed", DeliveryPayedSchema)
module.exports = DeliveryPayedModel