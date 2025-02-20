const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/sellerPayed.controller")
const Middleware = require("../middlewares")

const {} = require("../validations/sellerPayed.validation")


module.exports = router