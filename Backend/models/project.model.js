import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, "Project name is required"],
    unique: true,
    trim: true
  },

  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
})

const Project = mongoose.model("Project", projectSchema);

export default Project;