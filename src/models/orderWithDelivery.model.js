const { Schema, model } = require("mongoose");
const TypeOfBreadModel = require("./typOfbread.model");
const SellerModel = require("./seller.model");
const DeliveryModel = require("./delivery.model");
const MagazineModel = require("./magazine.model")

const OrderWithDeliverySchema = new Schema({
    typeOfBreadIds: [
        {
            bread: { type: Schema.Types.ObjectId, ref: TypeOfBreadModel },
            quantity: { type: Number, required: true }
        }
    ],
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    magazineId: { type: Schema.Types.ObjectId, ref: MagazineModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const OrderWithDeliveryModel = model("OrderWithDelivery", OrderWithDeliverySchema)
module.exports = OrderWithDeliveryModel