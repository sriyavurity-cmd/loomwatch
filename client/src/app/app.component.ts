import { Component, signal } from "@angular/core";
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

        <!-- Desktop nav: hidden on small screens -->
        <nav class="desktop-nav">
          <a routerLink="/leads" routerLinkActive="active">Leads</a>
          <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
          <a routerLink="/knowledge" routerLinkActive="active">Knowledge Base</a>
        </nav>
        <div class="user desktop-nav">
          <span class="role-badge" [class.founder]="user.role === 'founder'">{{ user.role }}</span>
          <span class="user-name">{{ user.name }}</span>
          <button class="logout" (click)="logout()">Sign out</button>
        </div>

        <!-- Mobile: hamburger toggle, hidden on larger screens -->
        <button class="menu-toggle" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()">
          <span></span><span></span><span></span>
        </button>
      </header>

      <!-- Mobile dropdown panel -->
      <div class="mobile-panel" *ngIf="menuOpen()">
        <div class="mobile-user">
          <span class="role-badge" [class.founder]="auth.currentUser()?.role === 'founder'">
            {{ auth.currentUser()?.role }}
          </span>
          <span class="user-name">{{ auth.currentUser()?.name }}</span>
        </div>
        <nav class="mobile-nav">
          <a routerLink="/leads" routerLinkActive="active" (click)="menuOpen.set(false)">Leads</a>
          <a routerLink="/tasks" routerLinkActive="active" (click)="menuOpen.set(false)">Tasks</a>
          <a routerLink="/knowledge" routerLinkActive="active" (click)="menuOpen.set(false)">Knowledge Base</a>
        </nav>
        <button class="logout mobile-logout" (click)="logout()">Sign out</button>
      </div>

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
        flex-shrink: 0;
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
      }
      .desktop-nav.user {
        margin-left: auto;
      }
      nav.desktop-nav {
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
        flex-shrink: 0;
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

      /* Hamburger toggle - hidden by default, shown only on small screens */
      .menu-toggle {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        width: 32px;
        height: 32px;
        background: transparent;
        border: 1px solid var(--slate-line);
        border-radius: var(--radius-sm);
        margin-left: auto;
        flex-shrink: 0;
      }
      .menu-toggle span {
        display: block;
        width: 16px;
        height: 1.5px;
        background: var(--paper-dim);
        margin: 0 auto;
      }

      .mobile-panel {
        display: none;
      }

      main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      /* ---- Responsive breakpoint ---- */
      @media (max-width: 680px) {
        .topbar {
          gap: 12px;
          padding: 0 16px;
        }
        .desktop-nav {
          display: none;
        }
        .menu-toggle {
          display: flex;
        }
        .brand-name {
          font-size: 13px;
        }

        .mobile-panel {
          display: flex;
          flex-direction: column;
          background: var(--ink-raised);
          border-bottom: 1px solid var(--slate-line);
          padding: 14px 16px 18px;
          gap: 14px;
          position: sticky;
          top: 60px;
          z-index: 9;
        }
        .mobile-user {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--slate-line);
        }
        .mobile-nav {
          flex-direction: column;
          gap: 2px;
        }
        .mobile-nav a {
          padding: 12px 14px;
          font-size: 14.5px;
        }
        .mobile-logout {
          align-self: flex-start;
        }
      }
    `
  ]
})
export class AppComponent {
  menuOpen = signal(false);

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}