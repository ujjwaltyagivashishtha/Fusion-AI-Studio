import userModel from "../models/user.model.js";

const registerUser = async ({
  email, password
}) => {
  if(!email || !password){
    throw new Error("Email and password are required");
  }

  const hashedPassword = await userModel.hashPassword(password);
  const user = userModel.create({
    email, 
    password: hashedPassword
  })

  return user;

}

export default { registerUser }