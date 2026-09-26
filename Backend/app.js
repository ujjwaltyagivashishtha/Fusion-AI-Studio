import "dotenv/config";
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";



connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/api/v1/users", userRoutes); // http://localhost:3000/api/v1/users/register


app.get("/", (req,res) => {
  res.send("Hello World");
})


export default app;