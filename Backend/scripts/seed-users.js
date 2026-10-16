import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const testUsers = [
  {
    email: "test@test.com",
    password: "password123",
    description: "Primary Account (Owner of 'banking-system' & 'resume builder')",
  },
  {
    email: "test@example.com",
    password: "password123",
    description: "Collaborator Account (Collaborator on 'resume builder')",
  },
  {
    email: "dev@fusion.ai",
    password: "password123",
    description: "Developer Account (Ready to add as collaborator)",
  },
  {
    email: "qa@fusion.ai",
    password: "password123",
    description: "QA / Reviewer Account (Clean state for new projects)",
  },
];

async function seedUsers() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    for (const u of testUsers) {
      const hashedPassword = await User.hashPassword(u.password);
      const existing = await User.findOne({ email: u.email });

      if (existing) {
        existing.password = hashedPassword;
        await existing.save();
        console.log(`✓ Updated password for: ${u.email}`);
      } else {
        await User.create({
          email: u.email,
          password: hashedPassword,
        });
        console.log(`✓ Created user: ${u.email}`);
      }
    }

    console.log("\nAll test users are ready!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding test users:", err);
    process.exit(1);
  }
}

seedUsers();
