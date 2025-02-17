const { Schema, model } = require("mongoose");
const DeliveryModel = require('./delivery.model')

const CreateMagazineModelSchema = new Schema({
    owner: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    avarageBread: { type: Number, required: true },
    DeliveryId: { type: Schema.Types.ObjectId, ref: DeliveryModel, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const CreateMagazineModel = model('createMagazine',CreateMagazineModelSchema)
module.exports = CreateMagazineModel