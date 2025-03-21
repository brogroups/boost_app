const { Schema, model } = require("mongoose");
const SuperAdminModel = require("./superAdmin.model");

const ManagerSchema = new Schema({
    username: { type: String, required: true, unique: true,trim:true },
    password: { type: String, required: true, unique: true,trim:true },
    superAdminId: { type: Schema.Types.ObjectId, ref: SuperAdminModel },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const ManagerModel = model("Manager", ManagerSchema)
module.exports = ManagerModel