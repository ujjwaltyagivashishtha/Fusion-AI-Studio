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

  const project = await projectModel.create({
    name,
    users: [userId]
  })

  return project;
}