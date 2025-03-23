const Joi = require("joi");

const CreateReturnProSchema = Joi.object({
    orderWithDelivery: Joi.array().required(),
})

const UpdateReturnedProSchema = Joi.object({
    orderWithDelivery: Joi.array().required(),
})

module.exports = { CreateReturnProSchema, UpdateReturnedProSchema }