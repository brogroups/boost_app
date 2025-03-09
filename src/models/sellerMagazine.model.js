const { Schema, model } = require("mongoose");
const SellerBreadModel = require("./sellerBread.model")
const SellerModel = require("./seller.model")

const SellerMagazineSchema = new Schema({
    sellerBreadId: { type: Schema.Types.ObjectId, ref: SellerBreadModel },
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerMagazineModel = model("SellerMagazine", SellerMagazineSchema)
module.exports = SellerMagazineModel