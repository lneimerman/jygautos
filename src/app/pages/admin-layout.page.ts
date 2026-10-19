import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-brand">Panel de administración</div>
        <nav class="admin-nav">
          <a routerLink="/admin/autos" routerLinkActive="active">Vehículos</a>
          <a routerLink="/admin/autos/nuevo" routerLinkActive="active">Alta nuevo</a>
          <a routerLink="/admin/integraciones" routerLinkActive="active">Integraciones</a>
          <a routerLink="/admin/mercado" routerLinkActive="active">Mercado</a>
        </nav>
        <a class="admin-site-link" routerLink="/">Ver el sitio</a>
      </aside>

      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutPage {}
