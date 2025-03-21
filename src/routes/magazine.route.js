const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/magazine.controller")
const Middleware = require("../middlewares")

const { CreateMagazineSchema, UpdateMagazineSchema, UpdateMagazinePendingSchema } = require("../validations/magazine.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")
const SellerModel = require("../models/seller.model")
const DeliveryModel = require("../models/delivery.model")

router.post("/magazine", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Middleware.verifyValidation(CreateMagazineSchema), Controller.createMagazine)
router.post("/magazine/pending", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Middleware.verifyValidation(UpdateMagazinePendingSchema), Controller.updateMagazinePending)
router.get("/magazines", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Controller.getMagazines)
router.get("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Controller.getMagazineById)
router.put("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Middleware.verifyValidation(UpdateMagazineSchema), Controller.updateMagazine)
router.delete("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel, DeliveryModel]), Controller.deleteMagazine)

module.exports = router