const { Router } = require('express')
const router = Router()

const Controller = require('../controllers/auth.controller')
const Middleware = require('../middlewares')

const { LoginAuthSchema,UpdatePasswordAuth } = require('../validations/auth.validation')

router.post('/login',Middleware.verifyValidation(LoginAuthSchema),Controller.AuthLogin)
router.get('/token',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Controller.getUserByToken) 
router.put("/auth/password",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.verifyValidation(UpdatePasswordAuth),Controller.updateUserAuth)
// api/login
module.exports = router