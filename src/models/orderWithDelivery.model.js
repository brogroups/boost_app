const { Schema, model } = require("mongoose");
const SellerModel = require("./seller.model");
const DeliveryModel = require("./delivery.model");
const SellerBreadModel = require("./sellerBread.model");
const ManagerWareModel = require("./managerWare.model");

const OrderWithDeliverySchema = new Schema({
    typeOfBreadIds: [
        {
            bread: { type: Schema.Types.ObjectId, ref: ManagerWareModel },
            quantity: { type: Number, required: true }
        }
    ],
    totalQuantity: { type: Number, required: true },
    totalQuantity2: { type: Number, required: true },
    pricetype: { type: String, required: true },
    // quantity: { type: Number, required: true },
    description: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    // sellerId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    // magazineId: { type: Schema.Types.ObjectId, ref: MagazineModel, required: true },
    status: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const OrderWithDeliveryModel = model("OrderWithDelivery", OrderWithDeliverySchema)
module.exports = OrderWithDeliveryModel