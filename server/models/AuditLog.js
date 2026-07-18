const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, required: true },
    question: { type: String, required: true },
    documentsAccessed: [
      {
        document: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
        title: String,
        clearance: String,
        score: Number
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
