const { Schema, model } = require("mongoose");
const SellerModel = require("./seller.model");

const SellerPayedSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    comment: { type: String, required: true },
    active: { type: Boolean, required: true,default:true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerPayedModel = model("SellerPayed", SellerPayedSchema)
module.exports = SellerPayedModel