import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";

// import "./cron/plantDegrader.js";

dotenv.config();

const app = express();

// -------------------------
// Security
// -------------------------

app.use(helmet());

// -------------------------
// Rate Limiting
// -------------------------

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

// -------------------------
// Body Parsers
// -------------------------

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// -------------------------
// Cookies
// -------------------------

app.use(cookieParser());

// -------------------------
// CORS
// -------------------------

app.use(
  cors({
    // origin: process.env.FRONTEND_URL
    //   ? [process.env.FRONTEND_URL]
    //   : [
    //       "http://localhost:3000",
    //       "http://192.168.12.77:3000",
    //     ],
    origin: "*",
    credentials: true,
  })
);

// -------------------------
// Routes
// -------------------------

app.use(`/api/${process.env.VERSION}/auth`, authRoutes);

app.use(`/api/${process.env.VERSION}/plant`, plantRoutes);

app.use(`/api/${process.env.VERSION}/shop`, shopRoutes);

// -------------------------
// Test Route
// -------------------------

app.get("/test", (req, res) => {
  console.log("Test route hit once again");

  res.send("Test route is working");
});


app.get('/', (req, res) => {
  res.send("This is just the backend, I am working in Frontend to make it better. it is incontinent with backend for now.");
});
// -------------------------
// 404 Handler
// -------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// -------------------------
// Global Error Handler
// -------------------------

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: err.message,
      details: err.details,
    });
  }

  // Prisma error
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      success: false,
      error: "Database Error",
      message: "A database error occurred. Please try again.",
    });
  }

  // General error
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : err.message,
  });
});

export default app;
