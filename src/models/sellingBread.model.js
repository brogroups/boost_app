const { Schema, model } = require("mongoose");
const TypeOfBreadModel = require("./typOfbread.model")
const DeliveryModel = require("./delivery.model")

const SellingBreadSchema = new Schema({
    typeOfBreadIds: [
        {type:Schema.Types.ObjectId,ref:TypeOfBreadModel,require:true}
    ],
    quantity: {type:Number,required:true},
    paymentMethod: {type:String,required:true},
    deliveryId: {type:Schema.Types.ObjectId,ref:DeliveryModel,required:true},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellingBreadModel = model("SellingBread",SellingBreadSchema)
module.exports = SellingBreadModel