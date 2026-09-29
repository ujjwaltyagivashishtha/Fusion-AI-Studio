import mongoose from "mongoose";
import projectModel from "../models/project.model.js";


export const createProject = async ({
  name,
  userId
}) => {
  if(!name){
    throw new Error("Project name is required");
  }

  if(!userId){
    throw new Error("User not found");
  }

  let project;
  try {
    project = await projectModel.create({
      name,
      users: [userId]
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
    throw error;
  }

  return project;
}

export const getAllUserProjects = async ({ userId }) => {
  if(!userId){
    throw new Error("User ID is required");
  }

  const userProjects = await projectModel.find({
    users: userId
  });

  return userProjects;
}


export const addUserToProjectService = async ({ projectId, users, userId }) => { 
  if(!projectId){
    throw new Error("Project ID is required");
  }

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new Error("Invalid Project ID")  
  }  

  if(!users){
    throw new Error("Users are required");
  } 

  if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))){
    throw new Error("Invalid user ID");
  }

  if(!userId){
    throw new Error("User not found");
  }

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId
  });

  if(!project){
    throw new Error("User not belong to this project");
  }

  const updatedProject = await projectModel.findOneAndUpdate(
    { _id: projectId },
    { $addToSet: { users: { $each: users } } },
    { new: true }
  )

  return updatedProject;
}
  

export const getProjectByIdService = async({ projectId }) => {
  if(!projectId){
    throw new Error("Project ID is required");
  }

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new Error("Invalid Project ID")
  }

  const project = await projectModel.findOne({ 
    _id: projectId 
  }).populate("users");
  return project;
}
  