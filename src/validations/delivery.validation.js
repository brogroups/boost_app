const Joi = require("joi");

const CreateDeliverySchema = Joi.object({
    username: Joi.string().required(),
    phone: Joi.string().optional().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    price: Joi.number().required(),
})

const UpdateDeliverySchema = Joi.object({
    username: Joi.string().required(),
    phone: Joi.string().optional().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    price: Joi.number().required(),
    password:Joi.string().optional()
})

const LoginDeliverySchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

module.exports = { CreateDeliverySchema, UpdateDeliverySchema, LoginDeliverySchema }