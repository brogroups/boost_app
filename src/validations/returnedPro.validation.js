const Joi = require("joi");

const CreateReturnProSchema = Joi.object({
    orderWithDelivery: Joi.string   ().required(),
})

const UpdateReturnedProSchema = Joi.object({
    orderWithDelivery: Joi.string   ().required(),
})

module.exports = { CreateReturnProSchema, UpdateReturnedProSchema }