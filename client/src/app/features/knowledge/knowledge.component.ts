import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { AuditLogEntry, KnowledgeDocument, KnowledgeSource } from "../../core/models";

interface QAEntry {
  question: string;
  answer: string;
  sources: KnowledgeSource[];
  asking?: boolean;
}

@Component({
  selector: "lw-knowledge",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">CLEARANCE-FILTERED RETRIEVAL</div>
          <h2>Knowledge Base</h2>
          <p class="sub">Ask a question — answers only draw from documents you're cleared to see.</p>
        </div>
        <div class="head-actions">
          <button class="ghost" *ngIf="isFounder()" (click)="toggleAudit()">
            {{ showAudit() ? "Hide" : "View" }} audit log
          </button>
          <button class="primary" (click)="drawerOpen.set(true)">+ New Document</button>
        </div>
      </div>

      <div class="main-grid">
        <div class="ask-panel">
          <form class="ask-form" (ngSubmit)="ask()">
            <input
              type="text"
              [(ngModel)]="question"
              name="question"
              placeholder="e.g. What did we agree with Acme on pricing?"
            />
            <button type="submit" class="primary" [disabled]="asking() || !question">
              {{ asking() ? "Thinking…" : "Ask" }}
            </button>
          </form>

          <div class="conversation" *ngIf="history().length; else noHistory">
            <div class="qa" *ngFor="let qa of history()">
              <div class="q">{{ qa.question }}</div>
              <div class="a">{{ qa.answer }}</div>
              <div class="sources" *ngIf="qa.sources.length">
                <span class="sources-label">SOURCES</span>
                <span class="source-chip" *ngFor="let s of qa.sources" [class]="s.clearance">
                  {{ s.title }} · {{ s.clearance }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noHistory>
            <div class="empty">No questions asked yet. Try one above.</div>
          </ng-template>
        </div>

        <div class="library-panel">
          <div class="panel-label">DOCUMENT LIBRARY ({{ documents().length }})</div>
          <div class="doc-card" *ngFor="let d of documents()">
            <div class="doc-top">
              <span class="doc-title">{{ d.title }}</span>
              <span class="clearance-badge" [class]="d.clearance">{{ d.clearance }}</span>
            </div>
            <p class="doc-preview">{{ d.content.slice(0, 110) }}{{ d.content.length > 110 ? "…" : "" }}</p>
            <button class="danger-ghost" (click)="removeDoc(d)">Delete</button>
          </div>
          <div class="empty" *ngIf="!documents().length">No documents yet — add company notes, contracts, or meeting summaries to build the knowledge base.</div>
        </div>
      </div>

      <!-- Audit log -->
      <div class="audit-panel" *ngIf="showAudit()">
        <div class="panel-label">AUDIT LOG — every question asked, by whom, and what was retrieved</div>
        <table>
          <thead>
            <tr><th>When</th><th>Who</th><th>Question</th><th>Docs accessed</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of auditLogs()">
              <td>{{ log.createdAt | date: "MMM d, h:mm a" }}</td>
              <td>{{ log.user?.name }} <span class="role-tag">{{ log.userRole }}</span></td>
              <td>{{ log.question }}</td>
              <td>
                <span class="source-chip" *ngFor="let s of log.documentsAccessed" [class]="s.clearance">{{ s.title }}</span>
                <span *ngIf="!log.documentsAccessed.length" class="none">none matched</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty" *ngIf="!auditLogs().length">No queries logged yet.</div>
      </div>

      <!-- New document drawer -->
      <div class="drawer" *ngIf="drawerOpen()">
        <div class="drawer-backdrop" (click)="drawerOpen.set(false)"></div>
        <div class="drawer-panel">
          <h3>New Document</h3>
          <form (ngSubmit)="saveDoc()">
            <label>
              <span>Title</span>
              <input type="text" [(ngModel)]="docForm.title" name="title" placeholder="e.g. Acme Corp — pricing call notes" required />
            </label>
            <label>
              <span>Content</span>
              <textarea [(ngModel)]="docForm.content" name="content" rows="8"
                placeholder="Paste meeting notes, contract terms, or anything you want searchable" required></textarea>
            </label>
            <label>
              <span>Clearance</span>
              <select [(ngModel)]="docForm.clearance" name="clearance">
                <option value="public">Public — anyone in the workspace</option>
                <option value="team">Team — team members and founder</option>
                <option value="founder" [disabled]="!isFounder()">Founder only</option>
              </select>
            </label>
            <div class="drawer-actions">
              <button type="button" class="ghost" (click)="drawerOpen.set(false)">Cancel</button>
              <button type="submit" class="primary">Add document</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 32px 40px 60px; max-width: 1250px; margin: 0 auto; width: 100%; }
      .page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; gap: 20px; }
      .eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; color: var(--amber); margin-bottom: 6px; }
      h2 { font-size: 24px; margin-bottom: 6px; }
      .sub { color: var(--paper-dim); font-size: 13.5px; margin: 0; max-width: 480px; }
      .head-actions { display: flex; gap: 10px; }

      .primary { background: var(--amber); color: var(--ink); border: none; padding: 10px 18px; border-radius: var(--radius-sm); font-weight: 600; font-size: 13.5px; white-space: nowrap; }
      .primary:hover:not(:disabled) { background: #f5b876; }
      .primary:disabled { opacity: 0.6; }
      .ghost { background: transparent; border: 1px solid var(--slate-line); color: var(--paper-dim); padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px; }

      .main-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; }

      .ask-panel { background: var(--ink-raised); border: 1px solid var(--slate-line); border-radius: var(--radius); padding: 20px; }
      .ask-form { display: flex; gap: 10px; margin-bottom: 18px; }
      .ask-form input {
        flex: 1; background: var(--ink); border: 1px solid var(--slate-line); border-radius: var(--radius-sm);
        padding: 11px 14px; color: var(--paper); font-size: 13.5px; font-family: var(--font-body);
      }
      .ask-form input:focus { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }

      .conversation { display: flex; flex-direction: column; gap: 16px; max-height: 520px; overflow-y: auto; }
      .qa { border-bottom: 1px solid var(--slate-line); padding-bottom: 16px; }
      .qa:last-child { border-bottom: none; }
      .q { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
      .a { font-size: 13.5px; color: var(--paper-dim); line-height: 1.6; margin-bottom: 10px; white-space: pre-wrap; }
      .sources { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .sources-label { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em; color: var(--paper-dim); margin-right: 4px; }
      .source-chip { font-family: var(--font-mono); font-size: 10.5px; padding: 3px 8px; border-radius: 20px; background: var(--slate); color: var(--paper-dim); margin-right: 4px; }
      .source-chip.founder { background: rgba(232, 104, 93, 0.15); color: var(--crimson); }
      .source-chip.team { background: rgba(79, 209, 197, 0.15); color: var(--teal); }
      .source-chip.public { background: rgba(242, 166, 90, 0.15); color: var(--amber); }

      .library-panel { background: var(--ink-raised); border: 1px solid var(--slate-line); border-radius: var(--radius); padding: 20px; max-height: 620px; overflow-y: auto; }
      .panel-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em; color: var(--paper-dim); margin-bottom: 14px; }
      .doc-card { background: var(--slate); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 10px; }
      .doc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px; }
      .doc-title { font-weight: 500; font-size: 13px; }
      .clearance-badge { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
      .clearance-badge.public { background: rgba(242, 166, 90, 0.15); color: var(--amber); }
      .clearance-badge.team { background: rgba(79, 209, 197, 0.15); color: var(--teal); }
      .clearance-badge.founder { background: rgba(232, 104, 93, 0.15); color: var(--crimson); }
      .doc-preview { font-size: 12px; color: var(--paper-dim); line-height: 1.5; margin: 0 0 8px; }
      .danger-ghost { background: transparent; border: 1px solid var(--slate-line); color: var(--paper-dim); font-size: 11.5px; padding: 5px 10px; border-radius: var(--radius-sm); }
      .danger-ghost:hover { border-color: var(--crimson); color: var(--crimson); }

      .empty { border: 1px dashed var(--slate-line); border-radius: var(--radius); padding: 24px; text-align: center; color: var(--paper-dim); font-size: 13px; }

      .audit-panel { margin-top: 18px; background: var(--ink-raised); border: 1px solid var(--slate-line); border-radius: var(--radius); padding: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
      th { text-align: left; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--paper-dim); padding: 8px; border-bottom: 1px solid var(--slate-line); }
      td { padding: 8px; border-bottom: 1px solid var(--slate-line); color: var(--paper-dim); vertical-align: top; }
      .role-tag { font-family: var(--font-mono); font-size: 9.5px; color: var(--amber); margin-left: 6px; }
      .none { color: #5a6072; font-style: italic; }

      .drawer { position: fixed; inset: 0; z-index: 20; display: flex; justify-content: flex-end; }
      .drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .drawer-panel { position: relative; width: 460px; max-width: 92vw; height: 100%; background: var(--ink-raised); border-left: 1px solid var(--slate-line); padding: 28px; overflow-y: auto; }
      .drawer-panel h3 { margin-bottom: 20px; }
      form { display: flex; flex-direction: column; gap: 16px; }
      label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--paper-dim); }
      input, textarea, select { background: var(--ink); border: 1px solid var(--slate-line); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--paper); font-size: 13.5px; font-family: var(--font-body); resize: vertical; }
      input:focus, textarea:focus, select:focus { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }
      .drawer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

      @media (max-width: 900px) {
        .main-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class KnowledgeComponent implements OnInit {
  documents = signal<KnowledgeDocument[]>([]);
  history = signal<QAEntry[]>([]);
  auditLogs = signal<AuditLogEntry[]>([]);
  drawerOpen = signal(false);
  showAudit = signal(false);
  asking = signal(false);
  question = "";

  docForm: Partial<KnowledgeDocument> = { title: "", content: "", clearance: "team" };

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.refreshDocs();
  }

  isFounder(): boolean {
    return this.auth.currentUser()?.role === "founder";
  }

  refreshDocs() {
    this.api.listDocuments().subscribe((data) => this.documents.set(data));
  }

  ask() {
    if (!this.question.trim() || this.asking()) return;
    const q = this.question;
    this.asking.set(true);
    this.api.ask(q).subscribe({
      next: (res) => {
        this.history.update((h) => [{ question: q, answer: res.answer, sources: res.sources }, ...h]);
        this.question = "";
        this.asking.set(false);
      },
      error: () => this.asking.set(false)
    });
  }

  saveDoc() {
    this.api.createDocument(this.docForm).subscribe(() => {
      this.drawerOpen.set(false);
      this.docForm = { title: "", content: "", clearance: "team" };
      this.refreshDocs();
    });
  }

  removeDoc(doc: KnowledgeDocument) {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    this.api.deleteDocument(doc._id).subscribe(() => this.refreshDocs());
  }

  toggleAudit() {
    this.showAudit.update((v) => !v);
    if (this.showAudit()) {
      this.api.auditLog().subscribe((logs) => this.auditLogs.set(logs));
    }
  }
}
