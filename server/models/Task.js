const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
