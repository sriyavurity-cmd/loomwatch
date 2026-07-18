import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/auth.service";

@Component({
  selector: "lw-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="panel">
        <div class="signature" aria-hidden="true">
          <div class="node n1"></div>
          <div class="node n2"></div>
          <div class="node n3"></div>
          <div class="node n4"></div>
          <svg class="lines" viewBox="0 0 300 300">
            <line x1="60" y1="70" x2="220" y2="60" />
            <line x1="60" y1="70" x2="90" y2="220" />
            <line x1="220" y1="60" x2="240" y2="210" />
            <line x1="90" y1="220" x2="240" y2="210" />
          </svg>
        </div>
        <div class="eyebrow">FOUNDER'S OPS DECK</div>
        <h1>Loomwatch</h1>
        <p class="tagline">Leads, tasks, and a knowledge base that only shows people what they're cleared to see.</p>

        <div class="tabs">
          <button [class.active]="mode() === 'login'" (click)="mode.set('login')">Sign in</button>
          <button [class.active]="mode() === 'register'" (click)="mode.set('register')">Create account</button>
        </div>

        <form (ngSubmit)="submit()">
          <label *ngIf="mode() === 'register'">
            <span>Name</span>
            <input type="text" [(ngModel)]="name" name="name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" [(ngModel)]="email" name="email" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" />
          </label>
          <label *ngIf="mode() === 'register'">
            <span>Your role in the workspace</span>
            <select [(ngModel)]="role" name="role">
              <option value="founder">Founder (sees everything)</option>
              <option value="member">Team member (sees public + team docs only)</option>
            </select>
          </label>

          <p class="error" *ngIf="error()">{{ error() }}</p>

          <button type="submit" class="submit" [disabled]="loading()">
            {{ loading() ? "Working…" : mode() === "login" ? "Enter the deck" : "Create account" }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .panel {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .signature {
        position: relative;
        width: 140px;
        height: 140px;
        margin-bottom: 20px;
      }
      .node {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--amber);
        box-shadow: 0 0 12px rgba(242, 166, 90, 0.7);
        animation: pulse 2.4s ease-in-out infinite;
      }
      .n1 { left: 22%; top: 18%; }
      .n2 { left: 70%; top: 12%; animation-delay: 0.5s; background: var(--teal); box-shadow: 0 0 12px rgba(79,209,197,0.6); }
      .n3 { left: 24%; top: 72%; animation-delay: 1s; }
      .n4 { left: 76%; top: 66%; animation-delay: 1.5s; background: var(--teal); box-shadow: 0 0 12px rgba(79,209,197,0.6); }
      .lines line {
        stroke: var(--slate-line);
        stroke-width: 1;
      }
      .lines {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.4); opacity: 1; }
      }

      .eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.18em;
        color: var(--amber);
        margin-bottom: 8px;
      }
      h1 {
        font-size: 30px;
        margin-bottom: 8px;
      }
      .tagline {
        color: var(--paper-dim);
        font-size: 14px;
        line-height: 1.5;
        max-width: 320px;
        margin-bottom: 28px;
      }

      .tabs {
        display: flex;
        width: 100%;
        border: 1px solid var(--slate-line);
        border-radius: var(--radius);
        overflow: hidden;
        margin-bottom: 22px;
      }
      .tabs button {
        flex: 1;
        padding: 10px;
        background: var(--ink-raised);
        border: none;
        color: var(--paper-dim);
        font-size: 13px;
        font-weight: 500;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .tabs button.active {
        background: var(--slate);
        color: var(--paper);
      }

      form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
        text-align: left;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12.5px;
        color: var(--paper-dim);
      }
      input, select {
        background: var(--ink-raised);
        border: 1px solid var(--slate-line);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        color: var(--paper);
        font-size: 14px;
        font-family: var(--font-body);
      }
      input:focus, select:focus {
        outline: 2px solid var(--amber);
        outline-offset: 1px;
        border-color: var(--amber);
      }

      .error {
        color: var(--crimson);
        font-size: 13px;
        margin: 0;
      }

      .submit {
        margin-top: 6px;
        background: var(--amber);
        color: var(--ink);
        border: none;
        padding: 12px;
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 14px;
        transition: transform 0.1s ease, background 0.15s ease;
      }
      .submit:hover:not(:disabled) {
        background: #f5b876;
      }
      .submit:active:not(:disabled) {
        transform: scale(0.98);
      }
      .submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `
  ]
})
export class LoginComponent {
  mode = signal<"login" | "register">("login");
  name = "";
  email = "";
  password = "";
  role: "founder" | "member" = "founder";
  loading = signal(false);
  error = signal("");

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error.set("");
    this.loading.set(true);

    const obs =
      this.mode() === "login"
        ? this.auth.login(this.email, this.password)
        : this.auth.register(this.name, this.email, this.password, this.role);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(["/scenarios"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || "Something went wrong. Please try again.");
      }
    });
  }
}
