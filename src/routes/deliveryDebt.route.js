const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/deliveryDebt.controller")
const Middleware = require("../middlewares")

const { CreateDeliveryDebtSchema, UpdateDeliveryDebtSchema } = require("../validations/deliveryDebt.validation")

module.exports = router