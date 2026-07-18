const express = require("express");
const Task = require("../models/Task");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 }).populate("lead", "name company");
  res.json(tasks);
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const { title, status, lead } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const task = await Task.create({
      owner: req.userId,
      title,
      status: status || "todo",
      lead: lead || null
    });
    const populated = await task.populate("lead", "name company");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create task." });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("lead", "name company");
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update task." });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });
  res.json({ deleted: true });
});

module.exports = router;
