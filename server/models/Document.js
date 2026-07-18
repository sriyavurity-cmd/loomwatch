const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    // Clearance-filtered retrieval, same principle as the Nexus RAG demo:
    // "public" - anyone in the workspace can see and query it
    // "team"   - team members and founders
    // "founder"- founder-only, e.g. sensitive financials or HR notes
    clearance: { type: String, enum: ["public", "team", "founder"], default: "team" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
