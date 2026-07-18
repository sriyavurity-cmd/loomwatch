const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "negotiating", "won", "lost"],
      default: "new"
    },
    notes: { type: String, default: "", trim: true },
    lastContact: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
