const { Schema, model } = require("mongoose");

const MagazineSchema = new Schema({
    title: { type: String, required: true },
    phone: { type: String},
    address: { type: String, required: true },
    pending: { type: Number, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const MagazineModel = model("Magazine", MagazineSchema)
module.exports = MagazineModel