const Joi = require("joi");

const CreateTypeOfBreadSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    price2: Joi.number().required(),
    price3: Joi.number().required(),
    price4: Joi.number().required(),
    status: Joi.boolean().required()
})

const UpdateTypeOfBreadSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    price2: Joi.number().required(),
    price3: Joi.number().required(),
    price4: Joi.number().required(),
    status: Joi.boolean().required()
})

module.exports = { CreateTypeOfBreadSchema, UpdateTypeOfBreadSchema }