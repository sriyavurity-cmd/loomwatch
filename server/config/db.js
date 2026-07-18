const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loomwatch";
  try {
    await mongoose.connect(uri);
    console.log("[db] connected to MongoDB");
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    console.error(
      "[db] Loomwatch requires MongoDB running locally or an Atlas URI in .env (MONGO_URI)."
    );
    process.exit(1);
  }
}

module.exports = connectDB;
