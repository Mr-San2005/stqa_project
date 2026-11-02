const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);

// Health check route — confirms server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

// Only connect and listen when run directly (node src/server.js / nodemon).
// When required by Supertest, the test's beforeAll manages the connection.
if (require.main === module) {
  require("dotenv").config();
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;