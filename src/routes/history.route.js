const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/history.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
// const ManagerModel = require("../models/manager.model")
// const SellerModel = require("../models/seller.model")
const DeliveryModel = require("../models/delivery.model")

// router.get("/histories", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.getAllHistory)
router.get("/history/delivery", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,DeliveryModel]), Controller.getDeliveryHistory)
// router.get("/history/seller/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel,SellerModel]), Controller.getSellerHistory)

module.exports = router