const Joi = require("joi");

const CreateManagerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const UpdateManagerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const LoginManagerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

module.exports = { CreateManagerSchema, UpdateManagerSchema,LoginManagerSchema }