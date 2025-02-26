const { Schema, model } = require("mongoose");
const TypeOfBreadModel = require("./typOfbread.model");
const SellerModel = require("./seller.model");

const OrderWithDeliverySchema = new Schema({
    typeOfBreadIds: [
        { type: Schema.Types.ObjectId, ref: TypeOfBreadModel }
        /// 
        /// {
        // }
    ],
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel,required:true },
    time: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const OrderWithDeliveryModel = model("OrderWithDelivery", OrderWithDeliverySchema)
module.exports = OrderWithDeliveryModel