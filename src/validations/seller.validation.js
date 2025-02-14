const Joi = require("joi");

const CreateSellerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    price: Joi.number().required(),
})

const UpdateSellerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    price: Joi.number().required(),
})

const LoginSellerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

module.exports = { CreateSellerSchema, UpdateSellerSchema, LoginSellerSchema }