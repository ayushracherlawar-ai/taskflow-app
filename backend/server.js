import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import "./db/database.js";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/tasks",
  authMiddleware,
  taskRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});