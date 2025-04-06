const { Schema, model } = require("mongoose");
const ManagerWareModel = require("./managerWare.model");

const SaleSchema = new Schema({
    breadId: { type: Schema.Types.ObjectId, ref: ManagerWareModel, required: true },
    money: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    pricetype: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    status: { type: Boolean, required: true, default: true }
}, { timestamps: true })

const SaleModel = model("Sale", SaleSchema)
module.exports = SaleModel