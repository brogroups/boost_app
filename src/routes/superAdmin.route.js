const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/superAdmin.controller")
const Middleware = require("../middlewares")

const { LoginSuperAdminSchema, UpdateSuperAdminSchema, RefreshTokenSuperAdminSchema } = require("../validations/superAdmin.validation")

router.post("/superAdmin/login", Middleware.verifyValidation(LoginSuperAdminSchema), Controller.loginSuperAdmin)
router.get("/superAdmin/token", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Controller.getSuperAdminByToken)
router.put("/superAdmin",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.verifyValidation(UpdateSuperAdminSchema),Controller.updateSuperAdmin)

module.exports = router