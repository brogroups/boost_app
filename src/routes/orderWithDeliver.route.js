const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/orderWithDelivery.controller")
const Middleware = require("../middlewares")
const SellerModel = require("../models/seller.model")
const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")

const { CreateOrderWithDeliverySchema, UpdateOrderWithDeliverySchema } = require("../validations/orderWithDelivery.validation")
const DeliveryModel = require("../models/delivery.model")


router.post("/orderWithDelivery", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Middleware.verifyValidation(CreateOrderWithDeliverySchema), Controller.createOrderWithDelivery)
router.get("/orderWithDeliveries", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Controller.getOrderWithDeliveries)
router.get("/orderWithDelivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Controller.getOrderWithDeliveryById)
router.put("/orderWithDelivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(UpdateOrderWithDeliverySchema), Controller.updateOrderWithDelivery)
router.delete("/orderWithDelivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.deleteOrderWithDelivery)

module.exports = router