import {Router} from "express"
import authController from "../controllers/auth.controller.js"

const authRouter = Router()

/**
 * @route POST api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register", authController.registerUserController)

/**
 * @route POST api/auth/login
 * @description login user with email and password
 * @access Public
 */

authRouter.post("/login", authController.loginUserController)

export default authRouter