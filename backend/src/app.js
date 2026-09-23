const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Home
app.get("/", (req, res) => {
    res.json({
        message: "AI Millionaire API is running"
    });
});

module.exports = app;