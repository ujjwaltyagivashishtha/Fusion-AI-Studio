import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
      required: [true, "Project name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "Full-stack AI workspace environment",
      trim: true,
    },
    template: {
      type: String,
      enum: ["node-express", "react-vite", "python-flask", "vanilla-web"],
      default: "node-express",
    },
    files: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.Mixed,
        },
        senderName: {
          type: String,
          default: "Developer",
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;