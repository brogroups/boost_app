const { Schema, model } = require("mongoose");
const TypeOfBread = require("../models/typOfbread.model")

const SellerBreadSchema = new Schema({
    typeOfBreadId: { type: Schema.Types.ObjectId, ref: TypeOfBread, required: true },
    quantity: { type: Number, required: true },
    time: { type: Date, required: true },
    price: { type: Number },
    name: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerBreadModel = model("SellerBread", SellerBreadSchema)
module.exports = SellerBreadModel