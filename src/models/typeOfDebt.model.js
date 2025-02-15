const { Schema, model } = require("mongoose");

const typeOfDebtSchema = new Schema({
    title: {type:String,required:true},
    price: {type:Number,required:true},
    quantity: {type:Number,required:true},
    version: {type:Number},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const TypeOfDebtModel = model("typeofDebt",typeOfDebtSchema)
module.exports = TypeOfDebtModel