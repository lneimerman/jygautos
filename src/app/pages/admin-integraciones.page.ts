import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService, type IntegrationsStatus } from '../services/admin-api.service';

@Component({
  selector: 'app-admin-integraciones-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="card">
        <h1 style="margin:0 0 6px;">Integraciones</h1>
        <p style="margin:0; opacity:0.9;">Conectá Instagram y Mercado Libre para publicar los autos desde el panel.</p>
      </div>

      <div class="card" style="margin-top: 16px;" *ngIf="notice() as n">{{ n }}</div>

      <div class="card" style="margin-top: 16px;" *ngIf="status() as s">
        <h2 style="margin-top:0;">Estado</h2>
        <p style="margin: 0 0 6px;">
          <strong>Modo de publicación:</strong>
          {{ s.mode === 'real' ? 'real' : 'de prueba (mock) — no se publica nada afuera' }}
        </p>
        <p style="margin: 0; opacity:0.85;" *ngIf="s.mode === 'real' && !s.publicBaseUrl">
          Falta configurar <code>app.publicBaseUrl</code> en el backend: Instagram y Mercado Libre descargan las fotos desde esa URL pública.
        </p>
      </div>

      <div class="grid" style="margin-top: 16px;" *ngIf="status() as s">
        <div class="card">
          <h3 style="margin:0 0 8px;">Mercado Libre</h3>
          <p style="margin: 0 0 6px;">
            {{ !s.mercadolibre.enabled ? 'Deshabilitado (ml.enabled=false)' : s.mercadolibre.connected ? 'Conectado' : 'Sin conectar' }}
          </p>
          <p style="margin: 0 0 10px; font-size:12px; opacity:0.75;" *ngIf="s.mercadolibre.expiresAt">
            Token vigente hasta {{ s.mercadolibre.expiresAt | date: 'short' }} (se renueva solo).
          </p>
          <button class="btn" type="button" (click)="connect('mercadolibre')" [disabled]="!s.mercadolibre.enabled">
            {{ s.mercadolibre.connected ? 'Reconectar' : 'Conectar' }}
          </button>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">Instagram / Facebook</h3>
          <p style="margin: 0 0 6px;">
            {{ !s.instagram.enabled ? 'Deshabilitado (instagram.enabled=false)' : s.instagram.connected ? 'Conectado' : 'Faltan credenciales' }}
          </p>
          <p style="margin: 0 0 10px; font-size:12px; opacity:0.75;">
            Usa la cuenta Business vinculada a una página de Facebook. El token y el ID de la cuenta se cargan en <code>instagram.properties</code>.
          </p>
          <button class="btn secondary" type="button" (click)="connect('instagram')" [disabled]="!s.instagram.enabled">
            Login con Facebook
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;" *ngIf="error()">{{ error() }}</div>
      <div class="card" style="margin-top: 16px;" *ngIf="loading()">Cargando...</div>
    </section>
  `,
})
export class AdminIntegracionesPage {
  readonly status = signal<IntegrationsStatus | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  constructor(
    private readonly api: AdminApiService,
    route: ActivatedRoute
  ) {
    const ml = route.snapshot.queryParamMap.get('ml');
    if (ml === 'ok') this.notice.set('Mercado Libre quedó conectado.');
    if (ml === 'error') this.notice.set('No se pudo conectar Mercado Libre. Probá de nuevo.');

    this.api.getIntegrations().subscribe({
      next: (s) => {
        this.status.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el estado de las integraciones.');
        this.loading.set(false);
      },
    });
  }

  connect(platform: 'mercadolibre' | 'instagram') {
    this.error.set(null);
    this.api.getIntegrationAuthUrl(platform).subscribe({
      next: (r) => (location.href = r.authUrl),
      error: (e) => this.error.set(e?.error?.message || 'No se pudo generar el link de conexión.'),
    });
  }
}
