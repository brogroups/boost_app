const { Schema } = require("mongoose");
const TypeOfBreadsModel = require("../models/typOfbread.model")
const DeliveryModel = require("./")

const SellingToBreadMagazineSchema = new Schema({
    typeOfBreads: [
        { type: Schema.Types.ObjectId, ref: TypeOfBreadsModel, required: true }
    ],
    quantity: {type:Number,required:true},
    payedType: {type:String,required:true},
    deliveryId: {type:Schema.Types.ObjectId,ref:DeliveryModel}
})