const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/typeOfPayed.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

const { createSchema, updateSchema } = require("../validations/TypeOfPayed.validation")

router.post("/typeOfPayed", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(createSchema), Controller.create)
router.get("/typeOfPayeds", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.findAll)
router.get("/typeOfPayed/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.findOne)
router.put("/typeOfPayed/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]),Middleware.verifyValidation(updateSchema), Controller.update)
router.delete("/typeOfPayed/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.delete)


module.exports = router