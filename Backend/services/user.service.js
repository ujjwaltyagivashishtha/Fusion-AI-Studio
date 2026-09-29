import userModel from "../models/user.model.js";

export const registerUser = async ({
  email, password
}) => {
  if(!email || !password){
    throw new Error("Email and password are required");
  }

  const hashedPassword = await userModel.hashPassword(password);
  const user = await userModel.create({
    email, 
    password: hashedPassword
  });

  return user;
}


export const getAllUser = async({ userId }) => {
  if(!userId){
    throw new Error("User ID is required");
  }

  const users = await userModel.find({ _id: { $ne: userId } });

  return users;
}
  