const { Schema, model } = require("mongoose");
const SuperAdminModel = require("./superAdmin.model");

const DeliverySchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    phone: { type: String },
    price: { type: Number, required: true },
    superAdminId: { type: Schema.Types.ObjectId, ref: SuperAdminModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const DeliveryModel = model("Delivery", DeliverySchema)
module.exports = DeliveryModel