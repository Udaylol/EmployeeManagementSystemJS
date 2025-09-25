const mongoose = require("mongoose");

async function connectDB(DATABASE_URL) {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };