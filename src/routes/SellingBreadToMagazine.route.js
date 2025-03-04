const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/SellingBreadToMagazine.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const ManagerModel = require("../models/manager.model")

const { CreateSellingToBreadMagazineSchema, UpdateSellingToBreadMagazineSchema } = require("../validations/SellingBreadToMagazine.validation")

router.post("/sellingBreadToMagazine", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(CreateSellingToBreadMagazineSchema), Controller.create)
router.get("/sellingBreadToMagazines", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findAll)
router.get("/sellingBreadToMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findOne)
router.put("/sellingBreadToMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(UpdateSellingToBreadMagazineSchema), Controller.update)
router.delete("/sellingBreadToMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.delete)

module.exports = router