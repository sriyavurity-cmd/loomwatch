import { Routes } from "@angular/router";
import { authGuard } from "./core/auth.guard";

export const routes: Routes = [
  { path: "login", loadComponent: () => import("./features/login/login.component").then((m) => m.LoginComponent) },
  {
    path: "leads",
    canActivate: [authGuard],
    loadComponent: () => import("./features/leads/leads.component").then((m) => m.LeadsComponent)
  },
  {
    path: "tasks",
    canActivate: [authGuard],
    loadComponent: () => import("./features/tasks/tasks.component").then((m) => m.TasksComponent)
  },
  {
    path: "knowledge",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/knowledge/knowledge.component").then((m) => m.KnowledgeComponent)
  },
  { path: "", redirectTo: "leads", pathMatch: "full" },
  { path: "**", redirectTo: "leads" }
];
