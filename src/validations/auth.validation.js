const Joi = require("joi");

const LoginAuthSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const UpdatePasswordAuth = Joi.object({
    password: Joi.string().required()
})

module.exports = { LoginAuthSchema, UpdatePasswordAuth }