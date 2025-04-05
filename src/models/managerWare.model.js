const { Schema, model } = require("mongoose");
// const ManagerModel = require("./manager.model");
const TypeOfBreadModel = require("./typOfbread.model");
const SellerModel = require("./seller.model");

const ManagerWareSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: SellerModel, required: true },
    bread: { type: Schema.Types.ObjectId, ref: TypeOfBreadModel, required: true },
    totalQuantity: { type: Number, required: true, default: 0 },
    totalQopQuantity: { type: Number, required: true, default: 0 },
    status: { type: Boolean,required:true, default: true },
}, { timestamps: true })

const ManagerWareModel = model("ManagerWare", ManagerWareSchema)
module.exports = ManagerWareModel