import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Lead, Task } from "../../core/models";

const STATUS_LABELS: Record<Task["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done"
};

@Component({
  selector: "lw-tasks",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">OPERATIONS</div>
          <h2>Tasks</h2>
          <p class="sub">What needs doing, and who it's tied to.</p>
        </div>
        <button class="primary" (click)="openNew()">+ New Task</button>
      </div>

      <div class="board" *ngIf="tasks().length; else empty">
        <div class="column" *ngFor="let status of statuses">
          <div class="column-head">
            <span>{{ labels[status] }}</span>
            <span class="count">{{ byStatus(status).length }}</span>
          </div>
          <div class="task-card" *ngFor="let t of byStatus(status)">
            <div class="task-title">{{ t.title }}</div>
            <div class="task-lead" *ngIf="t.lead">
              <span class="dot"></span>{{ t.lead.name }}{{ t.lead.company ? " · " + t.lead.company : "" }}
            </div>
            <div class="task-actions">
              <select [ngModel]="t.status" (ngModelChange)="changeStatus(t, $event)">
                <option *ngFor="let s of statuses" [value]="s">{{ labels[s] }}</option>
              </select>
              <button class="danger-ghost" (click)="remove(t)">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty">No tasks yet. Add your first one to get moving.</div>
      </ng-template>

      <div class="drawer" *ngIf="drawerOpen()">
        <div class="drawer-backdrop" (click)="closeDrawer()"></div>
        <div class="drawer-panel">
          <h3>New Task</h3>
          <form (ngSubmit)="save()">
            <label>
              <span>Title</span>
              <input type="text" [(ngModel)]="form.title" name="title" required />
            </label>
            <label>
              <span>Link to a lead <em>(optional)</em></span>
              <select [(ngModel)]="form.lead" name="lead">
                <option [ngValue]="null">— None —</option>
                <option *ngFor="let l of leads()" [ngValue]="l._id">{{ l.name }}</option>
              </select>
            </label>
            <div class="drawer-actions">
              <button type="button" class="ghost" (click)="closeDrawer()">Cancel</button>
              <button type="submit" class="primary">Add task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 32px 40px 60px; max-width: 1100px; margin: 0 auto; width: 100%; }
      .page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 20px; }
      .eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.16em; color: var(--amber); margin-bottom: 6px; }
      h2 { font-size: 24px; margin-bottom: 6px; }
      .sub { color: var(--paper-dim); font-size: 13.5px; margin: 0; }
      .primary { background: var(--amber); color: var(--ink); border: none; padding: 10px 18px; border-radius: var(--radius-sm); font-weight: 600; font-size: 13.5px; white-space: nowrap; }
      .primary:hover { background: #f5b876; }

      .board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
      .column-head { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--paper-dim); margin-bottom: 10px; padding: 0 4px; }
      .count { color: var(--amber); }

      .task-card { background: var(--ink-raised); border: 1px solid var(--slate-line); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 10px; }
      .task-title { font-weight: 500; font-size: 13.5px; margin-bottom: 8px; }
      .task-lead { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--teal); margin-bottom: 10px; }
      .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }
      .task-actions { display: flex; gap: 8px; align-items: center; }
      .task-actions select { flex: 1; font-size: 12px; padding: 6px 8px; }
      .danger-ghost { background: transparent; border: 1px solid var(--slate-line); color: var(--paper-dim); font-size: 11.5px; padding: 6px 10px; border-radius: var(--radius-sm); }
      .danger-ghost:hover { border-color: var(--crimson); color: var(--crimson); }

      .empty { border: 1px dashed var(--slate-line); border-radius: var(--radius); padding: 40px; text-align: center; color: var(--paper-dim); font-size: 13.5px; }

      .drawer { position: fixed; inset: 0; z-index: 20; display: flex; justify-content: flex-end; }
      .drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .drawer-panel { position: relative; width: 400px; max-width: 92vw; height: 100%; background: var(--ink-raised); border-left: 1px solid var(--slate-line); padding: 28px; overflow-y: auto; }
      .drawer-panel h3 { margin-bottom: 20px; }
      form { display: flex; flex-direction: column; gap: 16px; }
      label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--paper-dim); }
      label em { color: #6b7080; font-style: normal; }
      input, select { background: var(--ink); border: 1px solid var(--slate-line); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--paper); font-size: 13.5px; font-family: var(--font-body); }
      input:focus, select:focus { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }
      .drawer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
      .ghost { background: transparent; border: 1px solid var(--slate-line); color: var(--paper-dim); padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13.5px; }

      @media (max-width: 800px) {
        .board { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class TasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  leads = signal<Lead[]>([]);
  drawerOpen = signal(false);
  statuses: Task["status"][] = ["todo", "in_progress", "done"];
  labels = STATUS_LABELS;

  form: { title: string; lead: string | null } = { title: "", lead: null };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.refresh();
    this.api.listLeads().subscribe((data) => this.leads.set(data));
  }

  refresh() {
    this.api.listTasks().subscribe((data) => this.tasks.set(data));
  }

  byStatus(status: Task["status"]) {
    return this.tasks().filter((t) => t.status === status);
  }

  openNew() {
    this.form = { title: "", lead: null };
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  save() {
    this.api.createTask({ title: this.form.title, lead: this.form.lead }).subscribe(() => {
      this.drawerOpen.set(false);
      this.refresh();
    });
  }

  changeStatus(task: Task, status: Task["status"]) {
    this.api.updateTask(task._id, { status }).subscribe(() => this.refresh());
  }

  remove(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.api.deleteTask(task._id).subscribe(() => this.refresh());
  }
}
