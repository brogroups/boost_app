const { Schema, model } = require("mongoose");

const TypeOfBreadSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    price2: { type: Number, required: true },
    price3: { type: Number, required: true },
    price4: { type: Number, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const TypeOfBreadModel = model("TypeOfBread", TypeOfBreadSchema)
module.exports = TypeOfBreadModel

