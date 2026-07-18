import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Lead } from "../../core/models";

const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost"
};

@Component({
  selector: "lw-leads",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">PIPELINE</div>
          <h2>Leads &amp; Clients</h2>
          <p class="sub">Every deal you're tracking, in one place.</p>
        </div>
        <button class="primary" (click)="openNew()">+ New Lead</button>
      </div>

      <div class="board" *ngIf="leads().length; else empty">
        <div class="column" *ngFor="let status of statuses">
          <div class="column-head">
            <span>{{ labels[status] }}</span>
            <span class="count">{{ byStatus(status).length }}</span>
          </div>
          <div class="lead-card" *ngFor="let l of byStatus(status)" (click)="openEdit(l)">
            <div class="lead-name">{{ l.name }}</div>
            <div class="lead-company" *ngIf="l.company">{{ l.company }}</div>
            <div class="lead-notes" *ngIf="l.notes">{{ l.notes }}</div>
            <div class="lead-meta">Last contact {{ l.lastContact | date: "MMM d" }}</div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty">No leads yet. Add your first one to start building your pipeline.</div>
      </ng-template>

      <div class="drawer" *ngIf="drawerOpen()">
        <div class="drawer-backdrop" (click)="closeDrawer()"></div>
        <div class="drawer-panel">
          <h3>{{ editingId() ? "Edit Lead" : "New Lead" }}</h3>
          <form (ngSubmit)="save()">
            <label>
              <span>Name</span>
              <input type="text" [(ngModel)]="form.name" name="name" required />
            </label>
            <label>
              <span>Company</span>
              <input type="text" [(ngModel)]="form.company" name="company" />
            </label>
            <label>
              <span>Status</span>
              <select [(ngModel)]="form.status" name="status">
                <option *ngFor="let s of statuses" [value]="s">{{ labels[s] }}</option>
              </select>
            </label>
            <label>
              <span>Notes</span>
              <textarea [(ngModel)]="form.notes" name="notes" rows="4"></textarea>
            </label>

            <div class="drawer-actions">
              <button type="button" class="ghost" (click)="closeDrawer()">Cancel</button>
              <button type="submit" class="primary">{{ editingId() ? "Save changes" : "Add lead" }}</button>
            </div>
            <button type="button" class="danger-link" *ngIf="editingId()" (click)="remove()">Delete lead</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 32px 40px 60px; max-width: 1200px; margin: 0 auto; width: 100%; }
      .page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 20px; }
      .eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.16em; color: var(--amber); margin-bottom: 6px; }
      h2 { font-size: 24px; margin-bottom: 6px; }
      .sub { color: var(--paper-dim); font-size: 13.5px; margin: 0; }

      .primary { background: var(--amber); color: var(--ink); border: none; padding: 10px 18px; border-radius: var(--radius-sm); font-weight: 600; font-size: 13.5px; white-space: nowrap; }
      .primary:hover { background: #f5b876; }

      .board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; align-items: start; }
      .column-head {
        display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px;
        letter-spacing: 0.08em; text-transform: uppercase; color: var(--paper-dim); margin-bottom: 10px; padding: 0 4px;
      }
      .count { color: var(--amber); }

      .lead-card {
        background: var(--ink-raised); border: 1px solid var(--slate-line); border-radius: var(--radius);
        padding: 12px 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s ease;
      }
      .lead-card:hover { border-color: var(--amber-dim); }
      .lead-name { font-weight: 600; font-size: 13.5px; margin-bottom: 3px; }
      .lead-company { color: var(--teal); font-size: 12px; margin-bottom: 6px; }
      .lead-notes { color: var(--paper-dim); font-size: 12px; line-height: 1.4; margin-bottom: 8px;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .lead-meta { font-family: var(--font-mono); font-size: 10.5px; color: #5a6072; }

      .empty { border: 1px dashed var(--slate-line); border-radius: var(--radius); padding: 40px; text-align: center; color: var(--paper-dim); font-size: 13.5px; }

      .drawer { position: fixed; inset: 0; z-index: 20; display: flex; justify-content: flex-end; }
      .drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .drawer-panel { position: relative; width: 420px; max-width: 92vw; height: 100%; background: var(--ink-raised); border-left: 1px solid var(--slate-line); padding: 28px; overflow-y: auto; }
      .drawer-panel h3 { margin-bottom: 20px; }
      form { display: flex; flex-direction: column; gap: 16px; }
      label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--paper-dim); }
      input, textarea, select {
        background: var(--ink); border: 1px solid var(--slate-line); border-radius: var(--radius-sm);
        padding: 10px 12px; color: var(--paper); font-size: 13.5px; font-family: var(--font-body); resize: vertical;
      }
      input:focus, textarea:focus, select:focus { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }

      .drawer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
      .ghost { background: transparent; border: 1px solid var(--slate-line); color: var(--paper-dim); padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13.5px; }
      .danger-link { background: none; border: none; color: var(--crimson); font-size: 12.5px; margin-top: 12px; text-align: left; padding: 0; }

      @media (max-width: 1000px) {
        .board { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class LeadsComponent implements OnInit {
  leads = signal<Lead[]>([]);
  drawerOpen = signal(false);
  editingId = signal<string | null>(null);
  statuses: Lead["status"][] = ["new", "contacted", "negotiating", "won", "lost"];
  labels = STATUS_LABELS;

  form: Partial<Lead> = { name: "", company: "", status: "new", notes: "" };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.listLeads().subscribe((data) => this.leads.set(data));
  }

  byStatus(status: Lead["status"]) {
    return this.leads().filter((l) => l.status === status);
  }

  openNew() {
    this.editingId.set(null);
    this.form = { name: "", company: "", status: "new", notes: "" };
    this.drawerOpen.set(true);
  }

  openEdit(lead: Lead) {
    this.editingId.set(lead._id);
    this.form = { ...lead };
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  save() {
    const id = this.editingId();
    const req = id ? this.api.updateLead(id, this.form) : this.api.createLead(this.form);
    req.subscribe(() => {
      this.drawerOpen.set(false);
      this.refresh();
    });
  }

  remove() {
    const id = this.editingId();
    if (!id) return;
    if (!confirm("Delete this lead?")) return;
    this.api.deleteLead(id).subscribe(() => {
      this.drawerOpen.set(false);
      this.refresh();
    });
  }
}
