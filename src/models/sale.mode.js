const { Schema, model } = require("mongoose");

const SaleSchema = new Schema({
    breadId: { type: Schema.Types.ObjectId, ref: "SellerBread", required: true },
    saleBread: { type: Number, required: true },
    money: { type: Number, required: true },
    remainquantity: { type: Number, required: true },
    description: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    status: { type: Boolean, required: true, default: true }
}, { timestamps: true })

const SaleModel = model("Sale", SaleSchema)
module.exports = SaleModel