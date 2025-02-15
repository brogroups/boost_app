const { Schema, model } = require("mongoose");
const SellerBreadModel = require("./sellerBread.model")

const Debt1Schema = new Schema({
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    sellerBreadId: { type: Schema.Types.ObjectId, ref: SellerBreadModel, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const Debt1Model = model("Debt1", Debt1Schema)
module.exports = Debt1Model