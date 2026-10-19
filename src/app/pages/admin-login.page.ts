import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="card login-card">
        <h1>Ingresar al panel</h1>
        <p class="muted">Usá tu usuario y clave de administrador.</p>

        <form (ngSubmit)="onSubmit()" style="margin-top: 14px; display: grid; gap: 10px;">
          <label>
            Usuario
            <input name="username" [(ngModel)]="username" autocomplete="username" />
          </label>

          <label>
            Clave
            <input name="password" [(ngModel)]="password" type="password" autocomplete="current-password" />
          </label>

          <button class="btn" type="submit" [disabled]="loading()">Entrar</button>

          <p *ngIf="error()" style="margin: 0; color: var(--danger);">{{ error() }}</p>
        </form>
      </div>
    </section>
  `,
})
export class AdminLoginPage {
  username = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit() {
    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/admin/autos');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Usuario o clave incorrectos.');
      },
    });
  }
}
