import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { AskResponse, AuditLogEntry, KnowledgeDocument, Lead, Task } from "./models";

@Injectable({ providedIn: "root" })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  // Leads
  listLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.base}/leads`);
  }
  createLead(payload: Partial<Lead>): Observable<Lead> {
    return this.http.post<Lead>(`${this.base}/leads`, payload);
  }
  updateLead(id: string, payload: Partial<Lead>): Observable<Lead> {
    return this.http.put<Lead>(`${this.base}/leads/${id}`, payload);
  }
  deleteLead(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/leads/${id}`);
  }

  // Tasks
  listTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/tasks`);
  }
  createTask(payload: { title: string; status?: string; lead?: string | null }): Observable<Task> {
    return this.http.post<Task>(`${this.base}/tasks`, payload);
  }
  updateTask(id: string, payload: Partial<Task> & { lead?: string | null }): Observable<Task> {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, payload);
  }
  deleteTask(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/tasks/${id}`);
  }

  // Knowledge base (documents + RAG)
  listDocuments(): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.base}/documents`);
  }
  createDocument(payload: Partial<KnowledgeDocument>): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.base}/documents`, payload);
  }
  deleteDocument(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/documents/${id}`);
  }
  ask(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.base}/documents/ask`, { question });
  }
  auditLog(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.base}/documents/audit-log`);
  }
}
