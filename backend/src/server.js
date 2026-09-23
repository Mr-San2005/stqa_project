require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);

// Health check route — confirms server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;