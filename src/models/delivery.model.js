const { Schema, model } = require("mongoose");

const DeliverySchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, unique: true, trim: true },
    phone: { type: String },
    price: { type: Number, required: true },
    status: { type: Boolean, required: true, default: true },
    // superAdminId: { type: Schema.Types.ObjectId, ref: SuperAdminModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const DeliveryModel = model("Delivery", DeliverySchema)
module.exports = DeliveryModel