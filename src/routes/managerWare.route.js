const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/managerWare.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

const { createSchema } = require("../validations/managerWare.validation")

router.post("/manager's/warehouse", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.verifyValidation(createSchema), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.createManagerWare)
router.get("/manager's/warehouse", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.getManagerWare)
router.delete("/manager's/warehouse/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.deleteManagerWare)

module.exports = router