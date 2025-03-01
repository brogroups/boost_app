const { Schema, model } = require("mongoose");

const TypeOfPayedSchema = new Schema({
    type: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: {type:Date, default: new Date()}
})

const TypeOfPayedModel = model("TypeOfPayed",TypeOfPayedSchema)
module.exports = TypeOfPayedModel