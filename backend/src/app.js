const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const questionRoutes = require("./routes/question.routes");

const gameRoutes = require("./routes/game.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/categories",categoryRoutes);

app.use( "/api/questions", questionRoutes);

app.use("/api/games", gameRoutes);
// Home
app.get("/", (req, res) => {
    res.json({
        message: "AI Millionaire API is running"
    });
});

module.exports = app;