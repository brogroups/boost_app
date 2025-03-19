const { Schema, model } = require("mongoose");
const ManagerModel = require("./manager.model");

const Debt1Schema = new Schema({
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: ManagerModel, required: true },
    reason: { type: String, required: true },
    price: {type:Number,required:true},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const Debt1Model = model("Debt1", Debt1Schema)
module.exports = Debt1Model

// 67cf4dcb391a8de3bb8c121b