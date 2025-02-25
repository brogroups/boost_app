const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/debt1.controller")
const Middleware = require("../middlewares")
const SellerModel = require("../models/seller.model")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

const { CreateDebt1Schema, UpdateDebt1Schema } = require("../validations/debt1.validation")

router.post("/debt1", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(CreateDebt1Schema), Controller.createDebt1)
router.get("/debt1s", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.getDebt1s)
router.get("/debt1/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.getDebt1ById)
router.put("/debt1/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(UpdateDebt1Schema), Controller.updateDebt1ById)
router.delete("/debt1/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.deleteDebt1ById)

module.exports = router