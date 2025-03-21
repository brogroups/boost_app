const { Schema, model } = require("mongoose");
const SuperAdminModel = require("./superAdmin.model");

const SellerScheme = new Schema({
    username: { type: String, required: true, unique: true,trim:true },
    password: { type: String, required: true, unique: true,trim:true },
    phone: { type: String },
    // price: { type: Number, required: true },
    superAdminId: { type: Schema.Types.ObjectId, ref: SuperAdminModel, required: true },
    refreshToken: { type: String, required: true },
    ovenId: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SellerModel = model("Seller", SellerScheme)
module.exports = SellerModel