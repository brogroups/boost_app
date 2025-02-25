const Joi = require("joi");

const CreateWareHouseSchema = Joi.object({
    typeId: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

const UpdateWareHouseSchema = Joi.object({
    typeId: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

module.exports = {CreateWareHouseSchema,UpdateWareHouseSchema}