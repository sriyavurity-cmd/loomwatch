import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "./core/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "lw-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <header class="topbar" *ngIf="auth.currentUser() as user">
        <div class="brand">
          <span class="brand-mark">◎</span>
          <span class="brand-name">LOOMWATCH</span>
        </div>
        <nav>
          <a routerLink="/leads" routerLinkActive="active">Leads</a>
          <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
          <a routerLink="/knowledge" routerLinkActive="active">Knowledge Base</a>
        </nav>
        <div class="user">
          <span class="role-badge" [class.founder]="user.role === 'founder'">{{ user.role }}</span>
          <span class="user-name">{{ user.name }}</span>
          <button class="logout" (click)="logout()">Sign out</button>
        </div>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .topbar {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 0 28px;
        height: 60px;
        border-bottom: 1px solid var(--slate-line);
        background: var(--ink-raised);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-display);
        font-weight: 700;
        letter-spacing: 0.04em;
        font-size: 15px;
      }
      .brand-mark {
        color: var(--amber);
        font-size: 18px;
      }
      .brand-name {
        color: var(--paper);
      }

      nav {
        display: flex;
        gap: 4px;
        flex: 1;
      }
      nav a {
        text-decoration: none;
        color: var(--paper-dim);
        font-size: 13.5px;
        font-weight: 500;
        padding: 8px 14px;
        border-radius: var(--radius-sm);
        transition: color 0.15s ease, background 0.15s ease;
      }
      nav a:hover {
        color: var(--paper);
        background: var(--slate);
      }
      nav a.active {
        color: var(--amber);
        background: rgba(242, 166, 90, 0.08);
      }

      .user {
        display: flex;
        align-items: center;
        gap: 14px;
        font-family: var(--font-mono);
        font-size: 12.5px;
      }
      .user-name {
        color: var(--paper-dim);
      }
      .role-badge {
        font-family: var(--font-mono);
        font-size: 9.5px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 20px;
        background: var(--slate);
        color: var(--paper-dim);
      }
      .role-badge.founder {
        background: rgba(242, 166, 90, 0.15);
        color: var(--amber);
      }
      .logout {
        background: transparent;
        border: 1px solid var(--slate-line);
        color: var(--paper-dim);
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 12px;
        transition: border-color 0.15s ease, color 0.15s ease;
      }
      .logout:hover {
        border-color: var(--crimson);
        color: var(--crimson);
      }

      main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
