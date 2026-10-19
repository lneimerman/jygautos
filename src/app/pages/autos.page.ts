import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { ApiService } from '../services/api.service';
import type { Auto } from '../services/api.service';
import { CarCardComponent } from '../components/car-card.component';
import { CATEGORIES, parseCategory } from '../categories';
import type { Category } from '../categories';

@Component({
  selector: 'app-autos-page',
  standalone: true,
  imports: [FormsModule, RouterLink, CarCardComponent],
  template: `
    <section class="page">
      <div class="page-head">
        <h1>{{ heading() }}</h1>
        @if (!loading()) {
          <p class="muted">{{ filtered().length }} {{ filtered().length === 1 ? 'vehículo' : 'vehículos' }}</p>
        }
      </div>

      <nav class="chips" aria-label="Categorías">
        <a class="chip" [routerLink]="[]" [queryParams]="{}" [class.active]="!category()">
          Todos <small>{{ autos().length }}</small>
        </a>
        @for (c of categories; track c.value) {
          <a class="chip" [routerLink]="[]" [queryParams]="{ categoria: c.value }" [class.active]="category() === c.value">
            {{ c.plural }} <small>{{ counts()[c.value] }}</small>
          </a>
        }
      </nav>

      <div class="filters">
        <label>
          Marca
          <input [ngModel]="brand()" (ngModelChange)="brand.set($event)" name="brand" placeholder="Ej: Ford" />
        </label>
        <label>
          Modelo
          <input [ngModel]="model()" (ngModelChange)="model.set($event)" name="model" placeholder="Ej: Fiesta" />
        </label>
        @if (brand() || model()) {
          <button class="btn secondary" type="button" (click)="clear()">Limpiar filtros</button>
        }
      </div>

      @if (loading()) {
        <p class="muted">Cargando vehículos...</p>
      } @else if (error()) {
        <div class="empty">
          <h2>No pudimos cargar los vehículos</h2>
          <p>Probá de nuevo en unos minutos.</p>
        </div>
      } @else if (!filtered().length) {
        <div class="empty">
          @if (inScope().length) {
            <h2>Ningún vehículo coincide con tu búsqueda</h2>
            <p>Probá con otra marca o modelo.</p>
          } @else {
            <h2>Por ahora no hay {{ scopeName() }} a la venta</h2>
            <p>Volvé pronto o escribinos y te avisamos cuando ingrese uno.</p>
          }
        </div>
      } @else {
        <div class="cars">
          @for (a of filtered(); track a.id) {
            <app-car-card [auto]="a" />
          }
        </div>
      }
    </section>
  `,
})
export class AutosPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;
  readonly autos = signal<Auto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly brand = signal('');
  readonly model = signal('');

  readonly category = toSignal(
    this.route.queryParamMap.pipe(map((p) => parseCategory(p.get('categoria')))),
    { initialValue: null as Category | null }
  );

  readonly counts = computed(() => {
    const c: Record<Category, number> = { auto: 0, moto: 0, cuatriciclo: 0, trailer: 0 };
    for (const a of this.autos()) c[a.category ?? 'auto']++;
    return c;
  });

  readonly inScope = computed(() => {
    const cat = this.category();
    return cat ? this.autos().filter((a) => (a.category ?? 'auto') === cat) : this.autos();
  });

  readonly heading = computed(() => {
    const cat = this.category();
    const plural = CATEGORIES.find((c) => c.value === cat)?.plural;
    return `${plural ?? 'Vehículos'} a la venta`;
  });

  readonly scopeName = computed(() => {
    const cat = this.category();
    return (CATEGORIES.find((c) => c.value === cat)?.plural ?? 'vehículos').toLowerCase();
  });

  readonly filtered = computed(() => {
    const b = this.brand().trim().toLowerCase();
    const m = this.model().trim().toLowerCase();
    return this.inScope().filter((a) => {
      const okBrand = !b || (a.brand ?? '').toLowerCase().includes(b);
      const okModel = !m || (a.model ?? '').toLowerCase().includes(m);
      return okBrand && okModel;
    });
  });

  constructor() {
    this.api.listAutosPublicos().subscribe({
      next: (autos) => {
        this.autos.set(autos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  clear() {
    this.brand.set('');
    this.model.set('');
  }
}
