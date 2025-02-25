const { Schema, model } = require("mongoose");
const TypeofwarehouseModel = require("./typeofwarehouse.model")

const WareHouseSchema = new Schema({
    typeId: { type: Schema.Types.ObjectId, ref: TypeofwarehouseModel },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const WareHouseModel = model("WareHouse", WareHouseSchema)
module.exports = WareHouseModel