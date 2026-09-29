import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    })
  }

  try { 
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email});

    if(!loggedInUser){
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({name, userId});
    
    res.status(201).json({
      success: true,
      project: newProject
    }); 

  } catch (error) {
    console.log("Error creating project", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

export const getAllProjectsController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if(!loggedInUser){
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const allUserProjects = await projectService.getAllUserProjects({
      userId: loggedInUser._id
    });

    return res.status(200).json({
      success: true,
      projects: allUserProjects
    });

  } catch (error) {
    console.log("Error fetching projects", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
  
export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array()
    })
  }

  try {
    const { projectId, users } = req.body;
    
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if(!loggedInUser){
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updatedProject = await projectService.addUserToProjectService({
      projectId,
      users,
      userId: loggedInUser._id  
    })
    
    return res.status(200).json({
      success: true,
      project: updatedProject 
    })
    
  } catch (error) {
    console.log("Error adding user to project", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
    
  }
}



export const getProjectByIdController = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectByIdService({ projectId });
    return res.status(200).json({
      success: true,
      project: project
    });
  } catch (error) {
    console.log("Error fetching project", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

  