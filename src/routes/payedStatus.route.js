const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/payedStatus.controller")
const Middleware = require("../middlewares")

const { CreateSellerPayedStatusSchema, UpdateSellerPayedStatusSchema } = require("../validations/payedStatus.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

router.post("/payedStatus", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(CreateSellerPayedStatusSchema), Controller.create)
router.get("/payedStatuses",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.findAll)
router.get("/payedStatuses/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.findOne)
router.put("/payedStatuses/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(UpdateSellerPayedStatusSchema),Controller.update)
router.delete("/payedStatuses/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.delete)

module.exports = router