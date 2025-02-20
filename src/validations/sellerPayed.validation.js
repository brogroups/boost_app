const Joi = require("joi");

const createSelleyPayedSchema = Joi.object({
    sellerId: {type:String,required:true},
    price: {type:Number,required:true},
})

const updateSelleyPayedSchema = Joi.object({
    sellerId: {type:String,required:true},
    price: {type:Number,required:true},
})

module.exports  = {createSelleyPayedSchema,updateSelleyPayedSchema}