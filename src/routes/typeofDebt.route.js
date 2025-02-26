const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/typeofDebt.controller")
const Middleware = require("../middlewares")
const SellerModel = require("../models/seller.model")

const { CreateTypeOfDebtSchema, UpdateTypeOfDebtSchema } = require("../validations/typeofDebt.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

router.post("/typeOfDebt", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Middleware.verifyValidation(CreateTypeOfDebtSchema), Controller.createTypeOfDebt)
router.get("/typeOfDebts", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.getTypeOfDebt)
router.get("/typeOfDebt/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.getTypeOfDebtById)
router.put("/typeOfDebt/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]),Middleware.verifyValidation(UpdateTypeOfDebtSchema), Controller.updateTypeOfDebt)
router.delete("/typeOfDebt/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.deleteTypeOfDebt)

module.exports = router