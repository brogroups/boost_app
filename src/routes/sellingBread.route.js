const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/sellingBread.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const ManagerModel = require("../models/manager.model")

const { CreateSellingBreadSchema, UpdateSellingBreadSchema } = require("../validations/sellingBread.validation")


router.post("/sellingBread",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,DeliveryModel,ManagerModel]),Middleware.verifyValidation(CreateSellingBreadSchema),Controller.createSellingBread)
router.get("/sellingBreads",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,DeliveryModel,ManagerModel]),Controller.getSellingBread)
router.get("/sellingBread/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,DeliveryModel,ManagerModel]),Controller.getSellingBreadById)
router.put("/sellingBread/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,DeliveryModel,ManagerModel]),Middleware.verifyValidation(UpdateSellingBreadSchema),Controller.updateSellingBreadById)
router.delete("/sellingBread/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,DeliveryModel,ManagerModel]),Controller.deleteSellingBreadById)

module.exports = router