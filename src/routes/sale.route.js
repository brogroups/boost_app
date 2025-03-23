const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/sale.controller")
const Middleware = require("../middlewares")
const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")
const { CreateSaleSchema, UpdateSaleSchema } = require("../validations/sale.validation")



router.post("/sale", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(CreateSaleSchema), Controller.create)
router.get("/sales", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.findAll)
router.get("/sale/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.findOne)
router.put("/sale/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(UpdateSaleSchema), Controller.update)
router.delete("/sale/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.destroy)

module.exports = router