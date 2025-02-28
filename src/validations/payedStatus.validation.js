const Joi = require("joi");

const CreateSellerPayedStatusSchema = Joi.object({
    status: Joi.string().required()
})

const UpdateSellerPayedStatusSchema = Joi.object({
    status: Joi.string().required()
})

module.exports = { CreateSellerPayedStatusSchema, UpdateSellerPayedStatusSchema }