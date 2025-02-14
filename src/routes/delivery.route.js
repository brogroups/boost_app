const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/delivery.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const SellerModel = require("../models/seller.model")

const { CreateDeliverySchema, UpdateDeliverySchema, LoginDeliverySchema } = require("../validations/delivery.validation")



router.post("/delivery", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorretRole([SuperAdminModel,SellerModel]), Middleware.verifyValidation(CreateDeliverySchema), Controller.createDelivery)
router.post("/delivery/login",Middleware.verifyValidation(LoginDeliverySchema),Controller.loginDelivery)
router.get("/delivery/token",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,DeliveryModel,SellerModel]),Controller.getDeliveryByToken)
router.get("/deliveries",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,SellerModel]),Controller.getDeliveries)
router.get("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,DeliveryModel,SellerModel]),Controller.getDeliveryById)
router.put("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,DeliveryModel,SellerModel]),Middleware.verifyValidation(UpdateDeliverySchema),Controller.updateDelivery)
router.delete("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,SellerModel]),Controller.deleteDelivery)

module.exports = router