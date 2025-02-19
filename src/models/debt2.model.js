const { Schema, model } = require("mongoose");
const TypeOfDebtModel = require('./typeOfDebt.model')
const SellerModel = require("./seller.model")

const Debt2Schema = new Schema({
    debtId: {type:Schema.Types.ObjectId,ref:TypeOfDebtModel,required:true},
    quantity: {type:Number,required:true},
    description: {type:String,required:true},
    reason: {type:String,required:true},
    sellerId: {type:Schema.Types.ObjectId,ref:SellerModel,required:true},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const Debt2Model = model("Debt2",Debt2Schema)
module.exports = Debt2Model