import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// User Routes

// register
router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password").isLength({ min:3}).withMessage("Password must be at least 3 characters long"),
  userController.registerUserController
);


// login
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").isLength( { min: 3} ).withMessage("Password must be at least 3 characters long"),
  userController.loginUserController
);


// profile
router.get("/profile" ,authMiddleware.authUser ,userController.profileController);


// logout (supports both GET and POST for maximum compatibility)
router.get("/logout", authMiddleware.authUser, userController.logoutController);
router.post("/logout", authMiddleware.authUser, userController.logoutController);
// get all users
router.get(
  "/all",
  authMiddleware.authUser,
  userController.getAllUsersController
);

export default router;