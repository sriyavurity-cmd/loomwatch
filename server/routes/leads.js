const express = require("express");
const Lead = require("../models/Lead");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/leads
router.get("/", async (req, res) => {
  const leads = await Lead.find().sort({ updatedAt: -1 });
  res.json(leads);
});

// POST /api/leads
router.post("/", async (req, res) => {
  try {
    const { name, company, status, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required." });

    const lead = await Lead.create({
      owner: req.userId,
      name,
      company: company || "",
      status: status || "new",
      notes: notes || "",
      lastContact: new Date()
    });
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create lead." });
  }
});

// PUT /api/leads/:id
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status) updates.lastContact = new Date();
    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update lead." });
  }
});

// DELETE /api/leads/:id
router.delete("/:id", async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found." });
  res.json({ deleted: true });
});

module.exports = router;
