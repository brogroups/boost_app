const { Schema, model } = require("mongoose");

const MagazinePayedSchema = new Schema({
    pending: { type: Number, required: true },
    comment: { type: String, required: true },
    type: { type: String, required: true },
    magazineId: { type: Schema.Types.ObjectId, required: true }
})


const MagazinePayedModel = model("MagazinePayed", MagazinePayedSchema)
module.exports = MagazinePayedModel