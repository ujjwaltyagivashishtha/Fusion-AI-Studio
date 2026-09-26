import { Router } from "express";
import * as userController from "../Controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// User Routes

// register
router.post(
  "/register",
  body("email").isEmail().withMessage("Email must valid email address"),
  body("password").isLength({ min:3}).withMessage("Password must be at least 3 characters long"),
  userController.registerUserController
);


// login
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").isLength( { min: 3} ).withMessage("password must be at least 3 characters long "),
  userController.loginUserController
);

router.get("/profile" ,authMiddleware.authUser ,userController.profileController);

export default router;