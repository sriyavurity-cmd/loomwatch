const express = require("express");
const Document = require("../models/Document");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const requireAuth = require("../middleware/auth");
const { answerQuestion, clearanceAllowed } = require("../services/knowledgeEngine");

const router = express.Router();
router.use(requireAuth);

// GET /api/documents - list documents the current user's role is cleared to see
router.get("/", async (req, res) => {
  const all = await Document.find().sort({ createdAt: -1 });
  const visible = all.filter((d) => clearanceAllowed(req.userRole, d.clearance));
  res.json(visible);
});

// POST /api/documents - create a document
// Members cannot create founder-only documents.
router.post("/", async (req, res) => {
  try {
    const { title, content, clearance } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }
    if (clearance === "founder" && req.userRole !== "founder") {
      return res.status(403).json({ error: "Only founders can create founder-only documents." });
    }

    const doc = await Document.create({
      owner: req.userId,
      title,
      content,
      clearance: clearance || "team"
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create document." });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found." });
  if (!clearanceAllowed(req.userRole, doc.clearance)) {
    return res.status(403).json({ error: "You are not cleared to delete this document." });
  }
  await doc.deleteOne();
  res.json({ deleted: true });
});

// POST /api/documents/ask - clearance-filtered RAG question answering
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "A question is required." });
    }

    const allDocs = await Document.find();
    const { answer, sources } = await answerQuestion(question, allDocs, req.userRole);

    await AuditLog.create({
      user: req.userId,
      userRole: req.userRole,
      question,
      documentsAccessed: sources.map((s) => ({
        document: s.document,
        title: s.title,
        clearance: s.clearance,
        score: s.score
      }))
    });

    res.json({ answer, sources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not answer question." });
  }
});

// GET /api/documents/audit-log - founders only, see who asked what and what they accessed
router.get("/audit-log", async (req, res) => {
  if (req.userRole !== "founder") {
    return res.status(403).json({ error: "Only founders can view the audit log." });
  }
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate("user", "name email");
  res.json(logs);
});

module.exports = router;
