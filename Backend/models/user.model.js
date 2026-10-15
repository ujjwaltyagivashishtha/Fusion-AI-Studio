import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type:String,
    required:true,
    trim:true,
    unique:true,
    lowercase:true,
    minLength: [6, "Email must be at least 6 characters long"],
    maxLength: [50, "Email must be less than 50 characters long"],
  },
  password:{
    type:String,
    required:[true, "Password is required"],
    select: false 
  }

});

// Hashing the password 
userSchema.statics.hashPassword = async function(password){
  return await bcrypt.hash(password, 10);
}

// Compare password
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
}

// Generate jwt token
userSchema.methods.generateToken = async function(){
  return jwt.sign(
    { email: this.email, _id: this._id }, 
    process.env.JWT_SECRET,
    { expiresIn: "24h"})
}

const User = mongoose.model("User", userSchema);

export default User;  