import userModel from "../models/user.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";

const getUserId = async (req) => {
  if (req.user?._id) return req.user._id;
  const loggedInUser = await userModel.findOne({ email: req.user.email });
  return loggedInUser?._id;
};

export const createProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }

  try {
    const { name, template, description } = req.body;
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newProject = await projectService.createProject({
      name,
      userId,
      template,
      description
    });

    return res.status(201).json({
      success: true,
      project: newProject
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProjectsController = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const allUserProjects = await projectService.getAllUserProjects({
      userId
    });

    return res.status(200).json({
      success: true,
      projects: allUserProjects
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { projectId, users } = req.body;
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updatedProject = await projectService.addUserToProjectService({
      projectId,
      users,
      userId
    });

    return res.status(200).json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    console.error("Error adding user to project:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProjectByIdController = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectByIdService({ projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProjectFilesController = async (req, res) => {
  const { projectId } = req.params;

  try {
    const userId = await getUserId(req);
    const result = await projectService.getProjectFilesService({ projectId, userId });
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error fetching project files:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const saveProjectFilesController = async (req, res) => {
  const { projectId } = req.params;
  const { files } = req.body;

  try {
    const userId = await getUserId(req);
    const result = await projectService.saveProjectFilesService({
      projectId,
      userId,
      files
    });
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error saving project files:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProjectController = async (req, res) => {
  const { projectId } = req.params;

  try {
    const userId = await getUserId(req);
    const result = await projectService.deleteProjectService({ projectId, userId });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProjectController = async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  try {
    const userId = await getUserId(req);
    const updated = await projectService.updateProjectService({
      projectId,
      userId,
      name,
      description
    });
    return res.status(200).json({
      success: true,
      project: updated
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProjectMessagesController = async (req, res) => {
  const { projectId } = req.params;

  try {
    const userId = await getUserId(req);
    const messages = await projectService.getProjectMessagesService({ projectId, userId });
    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error fetching project messages:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addProjectMessageController = async (req, res) => {
  const { projectId } = req.params;
  const { text, sender, senderName } = req.body;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const updated = await projectService.addProjectMessageService({
      projectId,
      messageData: {
        text: text.trim(),
        sender: sender || req.user?._id || "user",
        senderName: senderName || req.user?.email?.split("@")[0] || "Developer",
        timestamp: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      messages: updated.messages
    });
  } catch (error) {
    console.error("Error adding project message:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};