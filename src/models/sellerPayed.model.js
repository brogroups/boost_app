const { Schema, model } = require("mongoose");
const SellerModel = require("./seller.model");
const PayedStatusModel = require("./payedStatus.model")
const PayedTypeModel = require("./typeOfPayed.model")

const SellerPayedSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    price: { type: Number, required: true },
    statusId: { type: Schema.Types.ObjectId, ref: PayedStatusModel, required: true },
    typeId: { type: Schema.Types.ObjectId, ref: PayedTypeModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerPayedModel = model("SellerPayed", SellerPayedSchema)
module.exports = SellerPayedModel