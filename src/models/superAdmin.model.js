const { Schema, model } = require("mongoose");

const SuperAdminSchema = new Schema({
    username: { type: String, required: true, unique: true,trim:true },
    password: { type: String, required: true, unique: true,trim:true },
    login: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: new Date() }
})

const SuperAdminModel = model("SuperAdmin", SuperAdminSchema)
module.exports = SuperAdminModel