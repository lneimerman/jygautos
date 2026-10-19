import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../services/admin-api.service';
import { CATEGORIES, type Category } from '../categories';

@Component({
  selector: 'app-admin-nuevo-auto-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="card">
      <h1 style="margin-top:0;">Alta de nuevo vehículo</h1>

      <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px;">
        <label>
          Categoría
          <select [(ngModel)]="category" name="category">
            <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
          </select>
        </label>

        <label>
          Título
          <input [(ngModel)]="title" name="title" />
        </label>

        <label>
          Marca
          <input [(ngModel)]="brand" name="brand" />
        </label>

        <label>
          Modelo
          <input [(ngModel)]="model" name="model" />
        </label>

        <label>
          Precio
          <input [(ngModel)]="price" name="price" type="number" />
        </label>

        <label>
          Año
          <input [(ngModel)]="year" name="year" type="number" />
        </label>

        <label>
          KM
          <input [(ngModel)]="km" name="km" type="number" />
        </label>

        <label style="grid-column: 1 / -1;">
          Descripción
          <textarea [(ngModel)]="description" name="description" rows="4"></textarea>
        </label>

        <label style="display:flex; align-items:center; gap:8px; grid-column: 1 / -1;">
          <input type="checkbox" [(ngModel)]="published" name="published" />
          Publicado
        </label>

        <label style="display:flex; align-items:center; gap:8px; grid-column: 1 / -1;">
          <input type="checkbox" [(ngModel)]="sold" name="sold" />
          Vendido
        </label>
      </div>

      <div style="margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn" type="button" (click)="save()" [disabled]="saving()">Guardar</button>
        <a class="btn secondary" routerLink="/admin/autos">Volver</a>
        <span *ngIf="error()" style="color:var(--danger);">{{ error() }}</span>
      </div>
    </section>
  `,
})
export class AdminNuevoAutoPage {
  readonly categories = CATEGORIES;
  category: Category = 'auto';
  title = '';
  brand = '';
  model = '';
  price?: number;
  year?: number;
  km?: number;
  description = '';
  published = false;
  sold = false;

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly api: AdminApiService, private readonly router: Router) {}

  save() {
    this.error.set(null);
    if (!this.title.trim()) {
      this.error.set('El título es obligatorio.');
      return;
    }

    this.saving.set(true);
    const published = this.sold ? false : this.published;
    this.api
      .createAuto({
        title: this.title.trim(),
        category: this.category,
        brand: this.brand || undefined,
        model: this.model || undefined,
        price: this.price,
        year: this.year,
        km: this.km,
        description: this.description || undefined,
        published,
        sold: this.sold,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigateByUrl('/admin/autos');
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar.');
        },
      });
  }
}
