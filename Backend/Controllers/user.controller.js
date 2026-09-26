import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";



// register user controller
export const registerUserController = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array(),
      success: false,
      message: "Validation failed"
    });
  }

  try{
      const user = await userService.registerUser(req.body);

      const token = await user.generateToken();

      res.status(200).json({
        user,
        token
      })
    }  catch(error){
      console.log("Error during registration: ", error);
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}


// login controller
export const loginUserController = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty){
    return res.status(400).json({
      errors: errors.array(),
      success: false,
      message: "Validation failed"
    })
  }

  try{
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if(!user){
      return res.status(401).json({
        success:false,
        message: "Invalid credentials"
      })
    }

    const isMatched = await user.comparePassword(password);

    if(!isMatched){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    } 

    const token = await user.generateToken();
    console.log(token);

    res.status(200).json({
      success: true,
      user,
      token,
    })
    
  } 
  catch(error){
    console.log("Error during login: ", error);
    res.status(500).json({
        success: false,
        message: error.message
      })
  }


}


// profile controller
export const profileController = async (req, res) => {
  try {
    console.log(req.user);
    
    res.status(200).json({
      user: req.user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// logout controller

export const logoutController = async (req, res) => {
  try {

    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({
      success: true,
      message: "Logout successfully"
    });
    
  } catch (error) {
    console.log("Error during logout: ", error);
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}