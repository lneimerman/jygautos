import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import type { Auto } from '../services/api.service';
import { whatsappLink } from '../site.config';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  template: `
    <article class="car">
      <div class="car-photo">
        @if (photo(); as src) {
          <img [src]="src" [alt]="auto().title" loading="lazy" />
        } @else {
          <svg class="car-placeholder" viewBox="0 0 64 32" aria-hidden="true">
            <path d="M5 22h54v-5l-9-2-6-8H24l-8 8-11 2z" />
            <circle cx="18" cy="23" r="4" />
            <circle cx="46" cy="23" r="4" />
          </svg>
        }
        @if (auto().year) {
          <span class="plate plate-sm">{{ auto().year }}</span>
        }
        @if (photoCount() > 1) {
          <span class="car-count">{{ photoCount() }} fotos</span>
        }
      </div>

      <div class="car-body">
        <h2 class="car-title">{{ auto().title }}</h2>
        @if (auto().km !== undefined && auto().km !== null) {
          <p class="car-meta">{{ auto().km | number }} km</p>
        }
        @if (auto().price !== undefined && auto().price !== null) {
          <p class="car-price">{{ auto().price | currency: (auto().currency || 'ARS') : 'symbol' : '1.0-0' }}</p>
        }
        @if (auto().description) {
          <p class="car-desc">{{ auto().description }}</p>
        }
        <a class="car-contact" [href]="wa()" target="_blank" rel="noopener">Consultar por WhatsApp</a>
      </div>
    </article>
  `,
})
export class CarCardComponent {
  readonly auto = input.required<Auto>();

  private readonly images = computed(() => (this.auto().media ?? []).filter((m) => m.type === 'image'));
  readonly photo = computed(() => this.images()[0]?.url ?? null);
  readonly photoCount = computed(() => this.images().length);
  readonly wa = computed(() => whatsappLink(`Hola, me interesa el ${this.auto().title}`));
}
