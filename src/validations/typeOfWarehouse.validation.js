const Joi = require("joi");

const CreateTypeOfWarehouseSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    status: Joi.boolean().required()
})

const UpdateTypeOfWarehouseSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    status: Joi.boolean().required()
})

module.exports = { CreateTypeOfWarehouseSchema, UpdateTypeOfWarehouseSchema }