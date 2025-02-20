const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/history.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

router.get("/histories",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getAllHistory)

module.exports = router