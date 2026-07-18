const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // Drives what clearance level of documents this user can see.
    // "founder" sees everything; "member" sees public + team only.
    role: { type: String, enum: ["founder", "member"], default: "founder" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
