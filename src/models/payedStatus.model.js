const { Schema, model } = require("mongoose");

const payedStatusSchema = new Schema({
    status: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: {type:Date, default: new Date()}
})

const payedStatusModel = model("payedStatus", payedStatusSchema)
module.exports =  payedStatusModel 