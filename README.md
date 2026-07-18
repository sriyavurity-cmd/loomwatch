# Loomwatch : Founder's Ops Copilot
**Live demo:** https://loomwatch.vercel.app
A lightweight internal tool for a startup founder: track leads, manage tasks,
and — the differentiating piece — a knowledge base with **clearance-filtered
retrieval**, so a question like "what did we agree with Acme on pricing?"
only ever surfaces answers from documents the person asking is actually
allowed to see.

Built for the Binaried AI Full Stack Developer Intern technical assignment.

## Why this shape

Two ideas were considered and rejected before landing here — worth being
upfront about, since the brief explicitly rewards honesty over polish:

1. A multi-agent social simulation ("watch AI personas interact") — creatively
   interesting, but it required manually typing out personality profiles for
   fictional agents every time, which isn't something a real founder would
   ever actually do day to day. Novelty without daily utility.
2. A pure RAG chatbot — a good AI showcase on its own, but disconnected from
   the actual operational work (leads, tasks) a founder's office does.

This build merges the useful half of an earlier RAG/RBAC prototype with a
genuinely usable ops layer, so nothing in the product requires typing data
a real business wouldn't already have anyway.

## What it does

- **Leads**: a Kanban-style pipeline (new → contacted → negotiating → won/lost)
- **Tasks**: to-do tracking, optionally linked to a lead
- **Knowledge Base**: paste in real documents (meeting notes, contract terms,
  internal memos), each tagged with a clearance level — `public`, `team`, or
  `founder`. Ask a question in plain English and the system retrieves the
  most relevant documents *the asker is cleared to see*, then has an LLM
  synthesize a grounded, cited answer from only those documents.
- **Audit log** (founder-only): every question asked, by whom, and exactly
  which documents were retrieved to answer it — so access to sensitive
  information is always traceable.

## Stack

- **Frontend**: Angular 18 (standalone components, signals)
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Auth**: JWT + bcrypt; each user has a role (`founder` or `member`) that
  drives what clearance level of documents they can see and query
- **AI**: Anthropic API synthesizes answers from retrieved documents, with a
  deterministic local fallback (direct snippet retrieval) if no API key is set

## Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local Mongo or an Atlas connection string)
# and JWT_SECRET (any long random string).
# ANTHROPIC_API_KEY is optional — leave blank to get raw snippet retrieval
# instead of an AI-synthesized answer.
npm start
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm start
```

Runs on `http://localhost:4200` (or the next free port if that's taken).
Register an account (choose "Founder" to see everything, or "Team member"
to test the clearance restriction), add a few leads and tasks, then add a
document or two at different clearance levels in the Knowledge Base and try
asking a question about them.

## AI tools used

- **Claude** (Anthropic) was used for architecture planning, generating the
  initial Express/Mongoose scaffolding and Angular components, and iterating
  on the retrieval/clearance design.
- The **retrieval and answer synthesis are runtime AI features of the
  product itself**, not just a build aid: every "ask" call ranks documents by
  relevance, filters by the asker's clearance, and calls the Anthropic API to
  produce a grounded, cited answer.

## Where AI helped vs. what I implemented myself

- AI helped scaffold CRUD routes/schemas quickly and helped design the
  term-frequency similarity scoring used for retrieval.
- I made the core decisions myself: keeping retrieval clearance-filtering
  entirely server-side (never trusting the client to only request what it's
  allowed to see), choosing a dependency-free local similarity scorer over
  requiring a separate embeddings API key (one less thing that can break a
  cold demo), and adding the audit log so clearance decisions are actually
  auditable, not just enforced silently.
- I reviewed the generated retrieval code specifically to make sure a
  "member" role truly cannot retrieve founder-only content even indirectly
  through the AI's synthesized answer — the LLM is only ever given documents
  that already passed the clearance filter, so it has nothing to leak.

## Challenges faced

- Original direction (a multi-agent simulation) tested well as a technical
  showcase but failed a basic "would anyone actually use this" test —
  changing course partway through meant re-cutting scope to fit the
  remaining time, which is reflected in this being a tighter, more focused
  build than the earlier draft.
- Getting clearance filtering right required deciding where enforcement
  lives: filtering only in the UI would have been insecure, so all
  filtering happens in the API layer, and the client only ever receives
  documents it was already allowed to see.

## If I had more time

- Add a `Workspace` model so leads, tasks, and documents are scoped per
  company rather than shared globally across every registered user. Right
  now all accounts see the same dataset — fine for a single-workspace demo,
  but not how this would need to work with multiple real companies using it.
- Real embeddings (e.g. via an embeddings API) instead of term-frequency
  similarity, for better retrieval on paraphrased questions.
- Let a founder bulk-import existing notes (Notion export, Slack export)
  instead of pasting documents one at a time.
- AI-drafted follow-up emails generated directly from a lead's notes.
- Move the audit log into its own dedicated view instead of a toggle panel
  on the Knowledge Base page.
