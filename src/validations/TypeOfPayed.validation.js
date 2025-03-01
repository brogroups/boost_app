const Joi = require("joi");

const createSchema = Joi.object({
    type:Joi.string().required()
})

const updateSchema = Joi.object({
    type:Joi.string().required()
})

module.exports = {createSchema,updateSchema}