const { model, Schema } = require("mongoose");

const TypeOfWareHouseSchema = new Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    status: { type: Boolean, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const TypeOfWareHouseModel = model("TypeOfWareHouse", TypeOfWareHouseSchema)
module.exports = TypeOfWareHouseModel