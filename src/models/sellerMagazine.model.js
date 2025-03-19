const { Schema, model } = require("mongoose");
const SellerBreadModel = require("./sellerBread.model")
const SellerModel = require("./seller.model");
const ManagerModel = require("./manager.model");

const SellerMagazineSchema = new Schema({
    sellerBreadId: { type: Schema.Types.ObjectId, ref: SellerBreadModel },
    managerId: { type: Schema.Types.ObjectId, ref: ManagerModel },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerMagazineModel = model("SellerMagazine", SellerMagazineSchema)
module.exports = SellerMagazineModel