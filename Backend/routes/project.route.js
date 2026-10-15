import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware.authUser,
  body("name").isString().withMessage("Name must be a string").trim().notEmpty().withMessage("Name cannot be empty"),
  projectController.createProjectController
);

router.get("/all", authMiddleware.authUser, projectController.getAllProjectsController);

router.put(
  "/add-user",
  authMiddleware.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray()
    .withMessage("Users must be an array")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProjectController
);

router.get("/get-project/:projectId", authMiddleware.authUser, projectController.getProjectByIdController);

// File management routes
router.get("/:projectId/files", authMiddleware.authUser, projectController.getProjectFilesController);
router.put(
  "/:projectId/files",
  authMiddleware.authUser,
  body("files").isObject().withMessage("Files payload must be an object"),
  projectController.saveProjectFilesController
);

// Project metadata & deletion routes
router.put("/:projectId", authMiddleware.authUser, projectController.updateProjectController);
router.delete("/:projectId", authMiddleware.authUser, projectController.deleteProjectController);

// Chat / Activity history routes
router.get("/:projectId/messages", authMiddleware.authUser, projectController.getProjectMessagesController);
router.post(
  "/:projectId/messages",
  authMiddleware.authUser,
  body("text").isString().withMessage("Message text is required"),
  projectController.addProjectMessageController
);

export default router;