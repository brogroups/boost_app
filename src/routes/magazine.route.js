const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/magazine.controller")
const Middleware = require("../middlewares")

const { CreateMagazineSchema, UpdateMagazineSchema } = require("../validations/magazine.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")
const SellerModel = require("../models/seller.model")

router.post("/magazine", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(CreateMagazineSchema), Controller.createMagazine)
router.get("/magazines", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.getMagazines)
router.get("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.getMagazineById)
router.put("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(UpdateMagazineSchema), Controller.updateMagazine)
router.delete("/magazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.deleteMagazine)

module.exports = router