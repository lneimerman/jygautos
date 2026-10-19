import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminApiService,
  type CotizResult,
  type MarketConfig,
  type MarketItem,
  type PriceAlert,
  type ScraperRunResult,
} from '../services/admin-api.service';

type SortKey = 'recent' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'kmAsc';

function toNumber(s: string): number {
  const m = s.replace(/\./g, '').match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

@Component({
  selector: 'app-admin-mercado-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div>
          <h1 style="margin:0 0 6px;">Mercado</h1>
          <p style="margin:0; opacity:0.9;">Avisos de Mercado Libre (dueño directo) y cotizador de precios.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn" [class.secondary]="tab() !== 'monitor'" type="button" (click)="tab.set('monitor')">Monitor</button>
          <button class="btn" [class.secondary]="tab() !== 'cotizador'" type="button" (click)="tab.set('cotizador')">Cotizador</button>
        </div>
      </div>

      <!-- ============ MONITOR ============ -->
      <ng-container *ngIf="tab() === 'monitor'">
        <div class="card" style="margin-top: 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div>
              <h2 style="margin:0 0 4px;">Scraper</h2>
              <p style="margin:0; font-size:13px; opacity:0.8;">
                Última ejecución: {{ lastRun() ? (lastRun() | date: 'short') : 'nunca' }} ·
                {{ results().length }} avisos guardados
              </p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn secondary" type="button" (click)="showConfig.set(!showConfig())">Configuración</button>
              <button class="btn" type="button" (click)="runScraper()" [disabled]="scraping()">
                {{ scraping() ? 'Buscando... (puede tardar varios minutos)' : 'Ejecutar scraper' }}
              </button>
            </div>
          </div>

          <p *ngIf="runInfo() as info" style="margin:10px 0 0;">{{ info }}</p>
          <p *ngIf="runError() as err" style="margin:10px 0 0; color:var(--danger);">{{ err }}</p>

          <div *ngIf="runMatches().length" style="margin-top:10px; display:grid; gap:4px; font-size:13px;">
            <strong>Coincidencias con alertas:</strong>
            <div *ngFor="let m of runMatches()">
              {{ m.alert }}: {{ m.item.title }} — {{ m.item.price }}
              <a [href]="m.item.link" target="_blank" rel="noopener" style="color:inherit;">ver</a>
            </div>
          </div>

          <div *ngIf="showConfig() && cfg() as c" style="margin-top:14px; display:grid; gap:10px;">
            <label>
              URL de búsqueda de Mercado Libre
              <input [ngModel]="c.baseUrl" (ngModelChange)="setCfg('baseUrl', $event)" name="cfgBaseUrl" />
            </label>
            <label>
              Páginas máximas
              <input type="number" [ngModel]="c.maxPages" (ngModelChange)="setCfg('maxPages', $event)" name="cfgMaxPages" />
            </label>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <button class="btn" type="button" (click)="saveCfg()">Guardar</button>
              <span *ngIf="cfgMsg()" style="opacity:0.85;">{{ cfgMsg() }}</span>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div class="card" style="margin-top: 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <h2 style="margin:0;">Alertas</h2>
            <button class="btn secondary" type="button" (click)="newAlert()">Nueva alerta</button>
          </div>

          <div *ngIf="showAlertForm()" style="margin-top:12px; display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px;">
            <label style="grid-column: 1 / -1;">
              Nombre
              <input [(ngModel)]="alertForm.name" name="alName" />
            </label>
            <label>
              Marca
              <input [(ngModel)]="alertForm.brand" name="alBrand" />
            </label>
            <label>
              Modelo
              <input [(ngModel)]="alertForm.model" name="alModel" />
            </label>
            <label>
              Año desde
              <input type="number" [(ngModel)]="alertForm.yearMin" name="alYearMin" />
            </label>
            <label>
              Año hasta
              <input type="number" [(ngModel)]="alertForm.yearMax" name="alYearMax" />
            </label>
            <label>
              KM máximo
              <input type="number" [(ngModel)]="alertForm.kmMax" name="alKmMax" />
            </label>
            <div style="grid-column: 1 / -1; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <button class="btn" type="button" (click)="saveAlert()">{{ editingAlertId ? 'Guardar cambios' : 'Crear alerta' }}</button>
              <button class="btn secondary" type="button" (click)="showAlertForm.set(false)">Cancelar</button>
              <span *ngIf="alertError()" style="color:var(--danger);">{{ alertError() }}</span>
            </div>
          </div>

          <p *ngIf="!alerts().length && !showAlertForm()" style="margin:12px 0 0; opacity:0.75;">
            No hay alertas. Una alerta marca los avisos nuevos que coinciden con una marca/modelo.
          </p>

          <div *ngFor="let a of alerts()" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <div>
                <strong>{{ a.name }}</strong>
                <span style="opacity:0.75; font-size:13px;">
                  {{ a.brand }} {{ a.model }}
                  <ng-container *ngIf="a.yearMin || a.yearMax"> | {{ a.yearMin || '...' }}-{{ a.yearMax || '...' }}</ng-container>
                  <ng-container *ngIf="a.kmMax"> | máx {{ a.kmMax | number }} km</ng-container>
                </span>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <label style="display:flex; align-items:center; gap:6px; font-size:13px;">
                  <input type="checkbox" style="width:auto;" [ngModel]="a.active" (ngModelChange)="toggleAlert(a, $event)" name="al{{a.id}}" />
                  Activa
                </label>
                <button class="btn secondary" type="button" *ngIf="a.brand || a.model" (click)="alertPrices(a)" [disabled]="alertLoading()[a.id]">
                  {{ alertLoading()[a.id] ? '...' : 'Precios ML' }}
                </button>
                <button class="btn secondary" type="button" (click)="editAlert(a)">Editar</button>
                <button class="btn secondary" type="button" (click)="removeAlert(a)">Eliminar</button>
              </div>
            </div>

            <ng-container *ngIf="alertResults()[a.id] as r">
              <div *ngIf="r.global_min; else noPrices" style="margin-top:8px; font-size:13px; display:flex; gap:16px; flex-wrap:wrap;">
                <span>{{ r.sources[0]?.count }} publicaciones</span>
                <span>Mín: U$S {{ r.global_min.price_usd | number }}</span>
                <span>Prom: U$S {{ r.global_avg_usd | number }}</span>
                <span>Máx: U$S {{ r.global_max?.price_usd | number }}</span>
              </div>
              <ng-template #noPrices>
                <p style="margin:8px 0 0; font-size:13px; opacity:0.75;">Sin resultados en Mercado Libre para esta búsqueda.</p>
              </ng-template>
            </ng-container>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card" style="margin-top: 16px; display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px;">
          <label>
            Buscar en el título
            <input [ngModel]="filterTitle()" (ngModelChange)="setFilter('title', $event)" name="fTitle" placeholder="Ej: Cronos" />
          </label>
          <label>
            Precio contiene
            <input [ngModel]="filterPrice()" (ngModelChange)="setFilter('price', $event)" name="fPrice" placeholder="Ej: 15.000" />
          </label>
          <label>
            Ordenar por
            <select
              [ngModel]="sortKey()"
              (ngModelChange)="sortKey.set($event); page.set(1)"
              name="fSort"
              style="width:100%; background:var(--surface-2); color:var(--text); border:1px solid var(--border); border-radius:10px; padding:10px 12px;"
            >
              <option value="recent">Más recientes</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="yearDesc">Año: más nuevos</option>
              <option value="kmAsc">Kilómetros: menos primero</option>
            </select>
          </label>
        </div>

        <div class="card" style="margin-top: 16px;" *ngIf="loading()">Cargando...</div>
        <div class="card" style="margin-top: 16px;" *ngIf="loadError()">Error cargando el monitor.</div>
        <div class="card" style="margin-top: 16px;" *ngIf="!loading() && !results().length">
          Todavía no hay resultados. Ejecutá el scraper para traer avisos.
        </div>

        <p style="margin: 16px 0 0; font-size:13px; opacity:0.8;" *ngIf="results().length">
          {{ filtered().length }} avisos
        </p>

        <div class="grid" style="margin-top: 10px;">
          <div class="card" *ngFor="let it of paged()">
            <img
              *ngIf="it.imageUrl"
              [src]="it.imageUrl"
              [alt]="it.title"
              loading="lazy"
              style="width:100%; height:170px; object-fit:cover; border-radius:10px; margin-bottom:10px;"
            />
            <h3 style="margin:0 0 6px; font-size:15px;">{{ it.title }}</h3>
            <p style="margin:0 0 4px;"><strong>{{ it.price }}</strong></p>
            <p style="margin:0; font-size:13px; opacity:0.85;">
              <ng-container *ngIf="it.year">{{ it.year }}</ng-container>
              <ng-container *ngIf="it.kms"> · {{ it.kms }}</ng-container>
            </p>
            <p style="margin:4px 0 0; font-size:12px; opacity:0.7;" *ngIf="it.location">{{ it.location }}</p>
            <div style="margin-top:10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <a class="btn secondary" [href]="it.link" target="_blank" rel="noopener">Ver aviso</a>
              <span *ngIf="it.phone" style="font-size:12px; opacity:0.8;">ID {{ it.phone }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="totalPages() > 1" style="margin-top:16px; display:flex; gap:10px; align-items:center; justify-content:center;">
          <button class="btn secondary" type="button" (click)="page.set(page() - 1)" [disabled]="page() <= 1">Anterior</button>
          <span>Página {{ page() }} de {{ totalPages() }}</span>
          <button class="btn secondary" type="button" (click)="page.set(page() + 1)" [disabled]="page() >= totalPages()">Siguiente</button>
        </div>
      </ng-container>

      <!-- ============ COTIZADOR ============ -->
      <ng-container *ngIf="tab() === 'cotizador'">
        <div class="card" style="margin-top: 16px;">
          <h2 style="margin-top:0;">Cotizador</h2>
          <p style="margin:0 0 12px; opacity:0.85;">Precio de mercado de un modelo en Mercado Libre.</p>
          <div style="display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px;">
            <label>
              Marca
              <input [(ngModel)]="cotizBrand" name="cBrand" placeholder="Ej: Toyota" />
            </label>
            <label>
              Modelo
              <input [(ngModel)]="cotizModel" name="cModel" placeholder="Ej: Corolla" />
            </label>
            <label>
              Año (opcional)
              <input [(ngModel)]="cotizYear" name="cYear" placeholder="Ej: 2020" />
            </label>
          </div>
          <div style="margin-top:12px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button class="btn" type="button" (click)="runCotizador()" [disabled]="cotizLoading() || !cotizBrand || !cotizModel">
              {{ cotizLoading() ? 'Buscando...' : 'Cotizar' }}
            </button>
            <span *ngIf="cotizError()" style="color:var(--danger);">{{ cotizError() }}</span>
          </div>
        </div>

        <ng-container *ngIf="cotizResult() as r">
          <div class="card" style="margin-top: 16px;" *ngIf="!r.global_min">Sin resultados en Mercado Libre para esa búsqueda.</div>

          <ng-container *ngIf="r.global_min">
            <p style="margin: 16px 0 0; font-size:13px; opacity:0.85;">
              {{ r.sources[0]?.count }} publicaciones analizadas
              <ng-container *ngIf="(r.sources[0]?.outliers_removed || 0) > 0"> · {{ r.sources[0].outliers_removed }} fuera de rango ignoradas</ng-container>
              <ng-container *ngIf="r.usd_rate"> · Dólar blue: $ {{ r.usd_rate | number: '1.0-0' }}</ng-container>
            </p>
            <div class="grid" style="margin-top: 10px;">
              <div class="card">
                <div style="opacity:0.75; font-size:13px;">Más barato</div>
                <h2 style="margin:6px 0;">U$S {{ r.global_min.price_usd | number }}</h2>
                <p style="margin:0; font-size:13px;" *ngIf="r.global_min.price_ars">$ {{ r.global_min.price_ars | number: '1.0-0' }}</p>
                <p style="margin:6px 0 0; font-size:13px; opacity:0.85;">{{ r.global_min.title }} <ng-container *ngIf="r.global_min.kms">· {{ r.global_min.kms }}</ng-container></p>
                <a class="btn secondary" style="margin-top:10px;" [href]="r.global_min.link" target="_blank" rel="noopener">Ver aviso</a>
              </div>
              <div class="card">
                <div style="opacity:0.75; font-size:13px;">Promedio</div>
                <h2 style="margin:6px 0;">U$S {{ r.global_avg_usd | number }}</h2>
                <p style="margin:0; font-size:13px;" *ngIf="r.global_avg_ars">$ {{ r.global_avg_ars | number: '1.0-0' }}</p>
              </div>
              <div class="card" *ngIf="r.global_max">
                <div style="opacity:0.75; font-size:13px;">Más caro</div>
                <h2 style="margin:6px 0;">U$S {{ r.global_max.price_usd | number }}</h2>
                <p style="margin:0; font-size:13px;" *ngIf="r.global_max.price_ars">$ {{ r.global_max.price_ars | number: '1.0-0' }}</p>
                <p style="margin:6px 0 0; font-size:13px; opacity:0.85;">{{ r.global_max.title }} <ng-container *ngIf="r.global_max.kms">· {{ r.global_max.kms }}</ng-container></p>
                <a class="btn secondary" style="margin-top:10px;" [href]="r.global_max.link" target="_blank" rel="noopener">Ver aviso</a>
              </div>
            </div>
          </ng-container>
        </ng-container>
      </ng-container>
    </section>
  `,
})
export class AdminMercadoPage {
  readonly tab = signal<'monitor' | 'cotizador'>('monitor');

  // Monitor
  readonly results = signal<MarketItem[]>([]);
  readonly lastRun = signal<string | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly scraping = signal(false);
  readonly runInfo = signal<string | null>(null);
  readonly runError = signal<string | null>(null);
  readonly runMatches = signal<ScraperRunResult['matches']>([]);

  readonly filterTitle = signal('');
  readonly filterPrice = signal('');
  readonly sortKey = signal<SortKey>('recent');
  readonly page = signal(1);
  readonly pageSize = 48;

  readonly filtered = computed(() => {
    const t = this.filterTitle().toLowerCase().trim();
    const p = this.filterPrice().toLowerCase().trim();
    let items = this.results().filter(
      (i) => (!t || i.title.toLowerCase().includes(t)) && (!p || i.price.toLowerCase().includes(p))
    );
    switch (this.sortKey()) {
      case 'priceAsc':
        items = [...items].sort((a, b) => toNumber(a.price) - toNumber(b.price));
        break;
      case 'priceDesc':
        items = [...items].sort((a, b) => toNumber(b.price) - toNumber(a.price));
        break;
      case 'yearDesc':
        items = [...items].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
        break;
      case 'kmAsc':
        items = [...items].sort((a, b) => toNumber(a.kms) - toNumber(b.kms));
        break;
    }
    return items;
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  // Configuración del scraper
  readonly showConfig = signal(false);
  readonly cfg = signal<MarketConfig | null>(null);
  readonly cfgMsg = signal<string | null>(null);

  // Alertas
  readonly alerts = signal<PriceAlert[]>([]);
  readonly showAlertForm = signal(false);
  readonly alertError = signal<string | null>(null);
  readonly alertResults = signal<Record<string, CotizResult | null>>({});
  readonly alertLoading = signal<Record<string, boolean>>({});
  editingAlertId = '';
  alertForm: Partial<PriceAlert> = {};

  // Cotizador
  cotizBrand = '';
  cotizModel = '';
  cotizYear = '';
  readonly cotizLoading = signal(false);
  readonly cotizError = signal<string | null>(null);
  readonly cotizResult = signal<CotizResult | null>(null);

  constructor(private readonly api: AdminApiService) {
    this.loadResults();
    this.loadAlerts();
    this.api.getMarketConfig().subscribe({ next: (c) => this.cfg.set(c), error: () => this.cfg.set(null) });
  }

  private errorMessage(e: any, fallback: string): string {
    return e?.error?.message || e?.error?.error || fallback;
  }

  // ---- Monitor ----
  loadResults() {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.getMarketResults().subscribe({
      next: (r) => {
        this.results.set(r.items);
        this.lastRun.set(r.lastRun);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  runScraper() {
    this.scraping.set(true);
    this.runInfo.set(null);
    this.runError.set(null);
    this.runMatches.set([]);
    this.api.runScraper().subscribe({
      next: (r) => {
        this.scraping.set(false);
        const origen = r.source === 'last-report' ? ' (el scraper falló: se cargó el último informe guardado)' : '';
        this.runInfo.set(`${r.total} avisos encontrados, ${r.alertMatches} coinciden con alertas${origen}.`);
        this.runMatches.set(r.matches);
        this.page.set(1);
        this.loadResults();
      },
      error: (e) => {
        this.scraping.set(false);
        this.runError.set(this.errorMessage(e, 'No se pudo ejecutar el scraper.'));
      },
    });
  }

  setFilter(which: 'title' | 'price', value: string) {
    if (which === 'title') this.filterTitle.set(value);
    else this.filterPrice.set(value);
    this.page.set(1);
  }

  // ---- Configuración ----
  setCfg(key: 'baseUrl' | 'maxPages', value: any) {
    const c = this.cfg();
    if (!c) return;
    this.cfg.set({ ...c, [key]: key === 'maxPages' ? (value === '' || value === null ? null : Number(value)) : value });
  }

  saveCfg() {
    const c = this.cfg();
    if (!c) return;
    this.cfgMsg.set(null);
    this.api.updateMarketConfig({ baseUrl: c.baseUrl, maxPages: c.maxPages ?? undefined }).subscribe({
      next: (saved) => {
        this.cfg.set(saved);
        this.cfgMsg.set('Guardado. Se aplica en la próxima ejecución.');
      },
      error: () => this.cfgMsg.set('No se pudo guardar.'),
    });
  }

  // ---- Alertas ----
  loadAlerts() {
    this.api.listAlerts().subscribe({ next: (a) => this.alerts.set(a), error: () => this.alerts.set([]) });
  }

  newAlert() {
    this.editingAlertId = '';
    this.alertForm = { name: '' };
    this.alertError.set(null);
    this.showAlertForm.set(true);
  }

  editAlert(a: PriceAlert) {
    this.editingAlertId = a.id;
    this.alertForm = { ...a };
    this.alertError.set(null);
    this.showAlertForm.set(true);
  }

  saveAlert() {
    const f = this.alertForm;
    if (!f.name?.trim()) {
      this.alertError.set('El nombre es obligatorio.');
      return;
    }
    const editing = !!this.editingAlertId;
    // Al editar, los campos vacíos se mandan como null para que se borren
    const empty = editing ? null : undefined;
    const payload = {
      name: f.name.trim(),
      brand: f.brand?.trim() || empty,
      model: f.model?.trim() || empty,
      yearMin: f.yearMin || empty,
      yearMax: f.yearMax || empty,
      kmMax: f.kmMax || empty,
    };
    const req = editing
      ? this.api.updateAlert(this.editingAlertId, payload)
      : this.api.createAlert(payload as Partial<PriceAlert> & { name: string });
    req.subscribe({
      next: () => {
        this.showAlertForm.set(false);
        this.loadAlerts();
      },
      error: () => this.alertError.set('No se pudo guardar la alerta.'),
    });
  }

  toggleAlert(a: PriceAlert, active: boolean) {
    this.api.updateAlert(a.id, { active }).subscribe({ next: () => this.loadAlerts() });
  }

  removeAlert(a: PriceAlert) {
    if (!confirm('¿Eliminar esta alerta?')) return;
    this.api.deleteAlert(a.id).subscribe({ next: () => this.loadAlerts() });
  }

  alertPrices(a: PriceAlert) {
    this.alertLoading.update((m) => ({ ...m, [a.id]: true }));
    const year = a.yearMin && a.yearMin === a.yearMax ? String(a.yearMin) : '';
    this.api.cotizar(a.brand ?? '', a.model ?? '', year).subscribe({
      next: (r) => {
        this.alertResults.update((m) => ({ ...m, [a.id]: r }));
        this.alertLoading.update((m) => ({ ...m, [a.id]: false }));
      },
      error: () => {
        this.alertResults.update((m) => ({ ...m, [a.id]: null }));
        this.alertLoading.update((m) => ({ ...m, [a.id]: false }));
      },
    });
  }

  // ---- Cotizador ----
  runCotizador() {
    this.cotizLoading.set(true);
    this.cotizError.set(null);
    this.cotizResult.set(null);
    this.api.cotizar(this.cotizBrand.trim(), this.cotizModel.trim(), this.cotizYear.trim()).subscribe({
      next: (r) => {
        this.cotizResult.set(r);
        this.cotizLoading.set(false);
      },
      error: (e) => {
        this.cotizError.set(this.errorMessage(e, 'No se pudo cotizar.'));
        this.cotizLoading.set(false);
      },
    });
  }
}
