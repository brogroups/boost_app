const Joi = require("joi");

const CreateSellerBread = Joi.object({
    typeOfBreadId: Joi.string().required(),
    quantity: Joi.number().required(),
    time: Joi.date().optional(),
})

const UpdateSellerBread = Joi.object({
    typeOfBreadId: Joi.string().required(),
    quantity: Joi.number().required(),
    time: Joi.date().optional(),
})

module.exports = { CreateSellerBread, UpdateSellerBread }