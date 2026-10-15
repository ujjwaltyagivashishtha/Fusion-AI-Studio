import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient, { blacklistToken } from "../services/redis.service.js";

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

      const userObj = user.toObject ? user.toObject() : { ...user._doc };
      delete userObj.password;

      res.status(201).json({
        success: true,
        user: userObj,
        token
      });
    } catch(error){
      console.log("Error during registration: ", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
};

// login controller
export const loginUserController = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array(),
      success: false,
      message: "Validation failed"
    });
  }

  try{
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if(!user){
      return res.status(401).json({
        success:false,
        message: "Invalid credentials"
      });
    }

    const isMatched = await user.comparePassword(password);

    if(!isMatched){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    } 

    const token = await user.generateToken();

    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: userObj,
      token,
    });
    
  } 
  catch(error){
    console.log("Error during login: ", error);
    res.status(500).json({
        success: false,
        message: error.message
    });
  }
};

// profile controller
export const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// logout controller
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blacklistToken(token, 60 * 60 * 24);
    }

    res.cookie("token", "");
    res.status(200).json({
      success: true,
      message: "Logout successfully"
    });
    
  } catch (error) {
    console.log("Error during logout: ", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all users controller
export const getAllUsersController = async(req, res) => {
  try {
    const userId = req.user?._id;
    let loggedInUser = null;
    if (!userId && req.user?.email) {
      loggedInUser = await userModel.findOne({ email: req.user.email });
    }
    const targetUserId = userId || loggedInUser?._id;

    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const allUsers = await userService.getAllUser({
      userId: targetUserId
    });

    return res.status(200).json({
      success: true,
      users: allUsers
    });

  } catch (error) {
    console.log("Error fetching all users: ", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};