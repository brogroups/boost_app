const { Schema, model } = require("mongoose");
const SellerBreadSchema = new Schema({
    typeOfBreadId: [
        {
            breadId: { type: Schema.Types.ObjectId, ref: "TypeOfBread", required: true },
            quantity: { type: Number, required: true },
            qopQuantity: { type: Number, required: true }
        }
    ],
    title: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    price: { type: Number },
    description: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    status: { type: Boolean, required: true,default:true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerBreadModel = model("SellerBread", SellerBreadSchema)
module.exports = SellerBreadModel