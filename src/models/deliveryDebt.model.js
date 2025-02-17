const { Schema, model } = require("mongoose");

const DeliveryDebtSchema = new Schema({
    reason: {type:String,required:true},
    price: {type:Number,required:true},
    description: {type:String,required:true},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const DeliveryDebtModel = model("DeliveryDebt",DeliveryDebtSchema)
module.exports = DeliveryDebtModel