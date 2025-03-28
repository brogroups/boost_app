const { Schema, model } = require("mongoose");
const ReturnedModel = require("./returnedPro.model");
const ManagerModel = require("./manager.model");

const InvalidProSchema = new Schema({
    ReturnedModel: { type: Schema.Types.ObjectId, ref: ReturnedModel, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: ManagerModel, required: true },
    status: { type: Boolean, required: true, default: true }
})


module.exports = model("InvalidPro", InvalidProSchema)