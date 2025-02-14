const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/orderWithDelivery.controller")
const Middleware = require("../middlewares")

const { CreateOrderWithDeliverySchema, UpdateOrderWithDeliverySchema } = require("../validations/orderWithDelivery.validation")


module.exports = router