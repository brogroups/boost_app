const { Schema, model } = require("mongoose");
// const TypeOfDebtModel = require('./typeOfDebt.model')
const TypeOfWareHouseModel = require("./typeofwarehouse.model");
const ManagerModel = require("./manager.model");

const Debt2Schema = new Schema({
    omborxonaProId: { type: Schema.Types.ObjectId, ref: TypeOfWareHouseModel, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    // reason: {type:String,required:true},
    managerId: { type: Schema.Types.ObjectId, ref: ManagerModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const Debt2Model = model("Debt2", Debt2Schema)
module.exports = Debt2Model