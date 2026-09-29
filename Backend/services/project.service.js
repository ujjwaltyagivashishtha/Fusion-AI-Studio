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


export const addUserToProjectService = async ({ projectId,users }) => { 
  if(!projectId){
    throw new Error("Project ID is required");
  }

  
}
  