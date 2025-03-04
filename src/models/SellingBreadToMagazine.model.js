const { Schema, model } = require("mongoose");
const TypeOfBreadsModel = require("../models/typOfbread.model")
const DeliveryModel = require("./delivery.model")
const MagazineModel = require("./magazine.model")

const SellingToBreadMagazineSchema = new Schema({
    typeOfBreads: [
        { type: Schema.Types.ObjectId, ref: TypeOfBreadsModel, required: true }
    ],
    quantity: {type:Number,required:true},
    payedType: {type:String,required:true},
    deliveryId: {type:Schema.Types.ObjectId,ref:DeliveryModel},
    magazineId: {type:Schema.Types.ObjectId,ref:MagazineModel},
    createdAt: { type: Date, default: new Date() },
    updateAt: {type:Date, default: new Date()}
})

const SellingToBreadMagazineModel = model("SellingBreadToMagazine",SellingToBreadMagazineSchema)
module.exports = SellingToBreadMagazineModel