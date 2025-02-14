const Joi = require("joi");

const LoginSuperAdminSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const UpdateSuperAdminSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const RefreshTokenSuperAdminSchema = Joi.object({
    refreshToken: Joi.string().required()
})

module.exports = { LoginSuperAdminSchema, UpdateSuperAdminSchema, RefreshTokenSuperAdminSchema }