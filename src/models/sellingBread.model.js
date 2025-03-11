const { Schema, model } = require("mongoose");
const TypeOfBreadModel = require("./typOfbread.model")
const DeliveryModel = require("./delivery.model")
const MagazineModel = require("./magazine.model")

const SellingBreadSchema = new Schema({
    typeOfBreadIds: [
        {
            breadId: { type: Schema.Types.ObjectId, ref: TypeOfBreadModel, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    paymentMethod: { type: String, required: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    magazineId: { type: Schema.Types.ObjectId, ref: MagazineModel, required: true },
    money: { type: Number, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellingBreadModel = model("SellingBread", SellingBreadSchema)
module.exports = SellingBreadModel