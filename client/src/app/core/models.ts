export type Role = "founder" | "member";
export type Clearance = "public" | "team" | "founder";

export interface Lead {
  _id: string;
  name: string;
  company: string;
  status: "new" | "contacted" | "negotiating" | "won" | "lost";
  notes: string;
  lastContact: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  lead: { _id: string; name: string; company: string } | null;
  createdAt?: string;
}

export interface KnowledgeDocument {
  _id: string;
  title: string;
  content: string;
  clearance: Clearance;
  createdAt?: string;
}

export interface KnowledgeSource {
  document: string;
  title: string;
  clearance: Clearance;
  score: number;
}

export interface AskResponse {
  answer: string;
  sources: KnowledgeSource[];
}

export interface AuditLogEntry {
  _id: string;
  user: { name: string; email: string };
  userRole: Role;
  question: string;
  documentsAccessed: KnowledgeSource[];
  createdAt: string;
}
