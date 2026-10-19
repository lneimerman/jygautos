import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Auto } from '../services/api.service';
import { AdminApiService, type IntegrationsStatus, type PublishLogEntry } from '../services/admin-api.service';
import { AuthService } from '../services/auth.service';
import { CATEGORIES, type Category } from '../categories';

@Component({
  selector: 'app-admin-autos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <h1 style="margin:0 0 6px;">Panel - Autos</h1>
          <p style="margin:0; opacity:0.9;">Cargá autos, información y fotos/videos.</p>
          <p style="margin:6px 0 0; font-size:12px; opacity:0.75;" *ngIf="integrations() as i">
            Publicación: {{ i.mode === 'real' ? 'real' : 'de prueba (mock)' }} ·
            Instagram {{ i.instagram.connected ? 'conectado' : 'sin conectar' }} ·
            Mercado Libre {{ i.mercadolibre.connected ? 'conectado' : 'sin conectar' }} ·
            <a routerLink="/admin/integraciones" style="color:inherit;">Integraciones</a>
          </p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a class="btn" routerLink="/admin/autos/nuevo">Nuevo vehículo</a>
          <button class="btn secondary" type="button" (click)="logout()">Salir</button>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2 style="margin-top:0;">Nuevo auto</h2>

        <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px;">
          <label>
            Categoría
            <select [(ngModel)]="newCategory" name="newCategory">
              <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
            </select>
          </label>

          <label>
            Título
            <input [(ngModel)]="newTitle" name="newTitle" />
          </label>

          <label>
            Marca
            <input [(ngModel)]="newBrand" name="newBrand" />
          </label>

          <label>
            Modelo
            <input [(ngModel)]="newModel" name="newModel" />
          </label>

          <label>
            Precio
            <input [(ngModel)]="newPrice" name="newPrice" type="number" />
          </label>

          <label>
            Año
            <input [(ngModel)]="newYear" name="newYear" type="number" />
          </label>

          <label>
            KM
            <input [(ngModel)]="newKm" name="newKm" type="number" />
          </label>

          <label style="grid-column: 1 / -1;">
            Descripción
            <textarea [(ngModel)]="newDescription" name="newDescription" rows="3"></textarea>
          </label>

          <label style="display:flex; align-items:center; gap:8px; grid-column: 1 / -1;">
            <input type="checkbox" [(ngModel)]="newPublished" name="newPublished" />
            Publicado
          </label>

          <label style="display:flex; align-items:center; gap:8px; grid-column: 1 / -1;">
            <input type="checkbox" [(ngModel)]="newSold" name="newSold" />
            Vendido
          </label>
        </div>

        <div style="margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn" type="button" (click)="create()" [disabled]="creating()">Crear</button>
          <span *ngIf="createError()" style="color:var(--danger);">{{ createError() }}</span>
        </div>
      </div>

      <div class="grid" style="margin-top: 16px;" *ngIf="autos() as autos">
        <div class="card" *ngFor="let a of autos">
          <div style="display:flex; justify-content:space-between; gap:10px;">
            <h3 style="margin:0;">{{ a.title }}</h3>
            <span style="opacity:0.85;" *ngIf="a.published">Publicado</span>
            <span style="opacity:0.65;" *ngIf="!a.published">Borrador</span>
          </div>

          <p style="margin: 8px 0 0;" *ngIf="a.price !== undefined"><strong>Precio:</strong> {{ a.price }} {{ a.currency || 'ARS' }}</p>
          <p style="margin: 6px 0 0;" *ngIf="a.year"><strong>Año:</strong> {{ a.year }}</p>
          <p style="margin: 6px 0 0;" *ngIf="a.km"><strong>KM:</strong> {{ a.km }}</p>

          <label style="margin-top: 10px;">
            Categoría
            <select [ngModel]="a.category" (ngModelChange)="changeCategory(a, $event)">
              <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
            </select>
          </label>

          <label style="display:flex; align-items:center; gap:8px; margin-top: 10px;">
            <input type="checkbox" [ngModel]="a.published" (ngModelChange)="togglePublished(a, $event)" />
            Publicado
          </label>

          <label style="display:flex; align-items:center; gap:8px; margin-top: 8px;">
            <input type="checkbox" [ngModel]="a.sold" (ngModelChange)="toggleSold(a, $event)" />
            Vendido
          </label>

          <div style="margin-top: 10px;">
            <input type="file" (change)="onFileSelected(a, $event)" />
          </div>

          <div style="margin-top: 10px; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn secondary" type="button" (click)="preparePublication(a)">Preparar publicación</button>
            <a class="btn secondary" [href]="getZipUrl(a)" target="_blank" rel="noopener">Descargar ZIP</a>
            <button class="btn secondary" type="button" (click)="publishInstagram(a, 'feed')">Publicar IG Feed{{ modeSuffix() }}</button>
            <button class="btn secondary" type="button" (click)="publishInstagram(a, 'story')">Publicar IG Story{{ modeSuffix() }}</button>
            <button class="btn secondary" type="button" (click)="publishMercadoLibre(a)">Publicar ML{{ modeSuffix() }}</button>
            <button class="btn secondary" type="button" *ngIf="mlPub(a)?.status === 'published'" (click)="setMlStatus(a, 'reserved')">Pausar en ML</button>
            <button class="btn secondary" type="button" *ngIf="mlPub(a)?.status === 'paused'" (click)="setMlStatus(a, 'available')">Reactivar en ML</button>
            <button class="btn secondary" type="button" (click)="remove(a)">Eliminar</button>
          </div>

          <div *ngIf="pubsFor(a).length" style="margin-top: 12px; display:grid; gap:6px; font-size: 12px; opacity: 0.9;">
            <div *ngFor="let p of pubsFor(a)">
              {{ targetLabel(p) }}: {{ statusLabel(p.status) }}
              <a *ngIf="p.url" [href]="p.url" target="_blank" rel="noopener" style="color:inherit;">ver</a>
            </div>
          </div>

          <div *ngIf="a.media.length" style="margin-top: 12px; display:grid; gap:6px;">
            <div *ngFor="let m of a.media.slice(0,3)" style="font-size: 12px; opacity: 0.9;">
              {{ m.type }}: {{ m.originalName }}
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;" *ngIf="loading()">Cargando...</div>
      <div class="card" style="margin-top: 16px;" *ngIf="loadError()">Error cargando autos.</div>
    </section>
  `,
})
export class AdminAutosPage {
  readonly autos = signal<Auto[] | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly integrations = signal<IntegrationsStatus | null>(null);
  readonly publications = signal<PublishLogEntry[]>([]);

  readonly categories = CATEGORIES;
  newCategory: Category = 'auto';
  newTitle = '';
  newBrand = '';
  newModel = '';
  newPrice?: number;
  newYear?: number;
  newKm?: number;
  newDescription = '';
  newPublished = false;
  newSold = false;

  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  constructor(
    private readonly api: AdminApiService,
    private readonly auth: AuthService
  ) {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.loadError.set(false);

    this.api.getIntegrations().subscribe({
      next: (i) => this.integrations.set(i),
      error: () => this.integrations.set(null),
    });
    this.loadPublications();

    this.api.listAutos().subscribe({
      next: (autos) => {
        this.autos.set(autos);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  create() {
    this.createError.set(null);
    if (!this.newTitle.trim()) {
      this.createError.set('El título es obligatorio.');
      return;
    }

    this.creating.set(true);
    this.api
      .createAuto({
        title: this.newTitle.trim(),
        category: this.newCategory,
        brand: this.newBrand.trim() || undefined,
        model: this.newModel.trim() || undefined,
        price: this.newPrice,
        year: this.newYear,
        km: this.newKm,
        description: this.newDescription || undefined,
        published: this.newSold ? false : this.newPublished,
        sold: this.newSold,
      })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.newTitle = '';
          this.newCategory = 'auto';
          this.newBrand = '';
          this.newModel = '';
          this.newPrice = undefined;
          this.newYear = undefined;
          this.newKm = undefined;
          this.newDescription = '';
          this.newPublished = false;
          this.newSold = false;
          this.refresh();
        },
        error: () => {
          this.creating.set(false);
          this.createError.set('No se pudo crear el auto.');
        },
      });
  }

  togglePublished(auto: Auto, value: boolean) {
    this.api.updateAuto(auto.id, { published: value }).subscribe({
      next: (updated) => {
        const list = this.autos();
        if (!list) return;
        this.autos.set(list.map((x) => (x.id === updated.id ? updated : x)));
      },
    });
  }

  changeCategory(auto: Auto, value: Category) {
    this.api.updateAuto(auto.id, { category: value }).subscribe({
      next: (updated) => {
        const list = this.autos();
        if (!list) return;
        this.autos.set(list.map((x) => (x.id === updated.id ? updated : x)));
      },
    });
  }

  toggleSold(auto: Auto, value: boolean) {
    const patch: Partial<Auto> = value ? { sold: true, published: false } : { sold: false };
    this.api.updateAuto(auto.id, patch).subscribe({
      next: (updated) => {
        const list = this.autos();
        if (!list) return;
        this.autos.set(list.map((x) => (x.id === updated.id ? updated : x)));
      },
    });
  }

  onFileSelected(auto: Auto, ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.api.uploadMedia(auto.id, file).subscribe({
      next: (updated) => {
        const list = this.autos();
        if (!list) return;
        this.autos.set(list.map((x) => (x.id === updated.id ? updated : x)));
        input.value = '';
      },
    });
  }

  remove(auto: Auto) {
    if (!confirm('¿Eliminar este auto?')) return;
    this.api.deleteAuto(auto.id).subscribe({
      next: () => this.refresh(),
    });
  }

  logout() {
    this.auth.logout();
    location.href = '/admin/login';
  }

  getZipUrl(auto: Auto): string {
    return this.api.getMediaZipUrl(auto.id);
  }

  preparePublication(auto: Auto) {
    this.api.getPublication(auto.id).subscribe({
      next: async (payload) => {
        try {
          await navigator.clipboard.writeText(payload.text);
          alert('Texto copiado al portapapeles.');
        } catch {
          alert(payload.text);
        }
      },
      error: () => alert('No se pudo generar el texto.'),
    });
  }

  modeSuffix(): string {
    return this.integrations()?.mode === 'real' ? '' : ' (mock)';
  }

  loadPublications() {
    this.api.listPublications().subscribe({
      next: (list) => this.publications.set(list),
      error: () => this.publications.set([]),
    });
  }

  // Ultima publicación por plataforma/ubicación (sin errores), para mostrar en la tarjeta
  pubsFor(auto: Auto): PublishLogEntry[] {
    const seen = new Set<string>();
    const out: PublishLogEntry[] = [];
    for (const p of this.publications()) {
      if (p.autoId !== auto.id || p.status === 'error') continue;
      const key = `${p.target}:${p.placement ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
    return out.slice(0, 4);
  }

  mlPub(auto: Auto): PublishLogEntry | undefined {
    return this.pubsFor(auto).find((p) => p.target === 'mercadolibre' && !!p.externalId);
  }

  targetLabel(p: PublishLogEntry): string {
    if (p.target === 'instagram') return `Instagram ${p.placement === 'story' ? 'Story' : 'Feed'}`;
    if (p.target === 'mercadolibre') return 'Mercado Libre';
    return 'WhatsApp';
  }

  statusLabel(status: PublishLogEntry['status']): string {
    const labels: Record<PublishLogEntry['status'], string> = {
      mocked: 'simulada',
      published: 'publicada',
      paused: 'pausada',
      closed: 'cerrada',
      error: 'error',
    };
    return labels[status];
  }

  private errorMessage(e: any): string {
    return e?.error?.message || e?.error?.error || 'No se pudo publicar.';
  }

  publishInstagram(auto: Auto, placement: 'feed' | 'story') {
    this.api.publishAuto(auto.id, 'instagram', placement).subscribe({
      next: (r) => {
        alert(`OK (${r.mode}) - Instagram ${placement}.`);
        this.loadPublications();
      },
      error: (e) => {
        alert(this.errorMessage(e));
        this.loadPublications();
      },
    });
  }

  publishMercadoLibre(auto: Auto) {
    this.api.publishAuto(auto.id, 'mercadolibre').subscribe({
      next: (r) => {
        alert(`OK (${r.mode}) - Mercado Libre.`);
        this.loadPublications();
      },
      error: (e) => {
        alert(this.errorMessage(e));
        this.loadPublications();
      },
    });
  }

  setMlStatus(auto: Auto, status: 'available' | 'reserved') {
    this.api.setMercadoLibreStatus(auto.id, status).subscribe({
      next: () => this.loadPublications(),
      error: (e) => alert(this.errorMessage(e)),
    });
  }
}
