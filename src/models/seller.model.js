const { Schema, model } = require("mongoose");
const SuperAdminModel = require("./superAdmin.model");

const SellerScheme = new Schema({
    username: { type: String, required: true,unique:true },
    password: { type: String, required: true,unique:true },
    phone: { type: String, required: true },
    price: { type: Number, required: true },
    superAdminId: { type: Schema.Types.ObjectId,ref:SuperAdminModel, required: true },
    refreshToken: {type:String,required:true},
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerModel = model("Seller", SellerScheme)
module.exports = SellerModel