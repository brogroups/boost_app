const Joi = require("joi");

const CreateTypeOfWarehouseSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

const UpdateTypeOfWarehouseSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

module.exports = { CreateTypeOfWarehouseSchema, UpdateTypeOfWarehouseSchema }