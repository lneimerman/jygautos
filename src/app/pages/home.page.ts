import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../categories';
import { ApiService } from '../services/api.service';
import type { Auto } from '../services/api.service';
import { CarCardComponent } from '../components/car-card.component';

// Datos de muestra: se usan solo cuando todavia no hay stock cargado en el admin,
// para que las secciones de categorias y "Ultimos ingresos" no se vean vacias.
// Las fotos son de stock (Pexels, uso libre) y viven en public/mock-cars/.
function mockPhoto(filename: string) {
  return {
    id: `mock-media-${filename}`,
    type: 'image' as const,
    url: `mock-cars/${filename}`,
    filename,
    originalName: filename,
    mimeType: 'image/jpeg',
    size: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
  };
}

const MOCK_VEHICLES: Auto[] = [
  {
    id: 'mock-1',
    title: 'Volkswagen Vento 2.0',
    category: 'auto',
    year: 2019,
    km: 68400,
    price: 8500000,
    currency: 'ARS',
    description: 'Sedán automático, único dueño, service oficial al día.',
    published: true,
    sold: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    media: [mockPhoto('sedan.jpg')],
  },
  {
    id: 'mock-2',
    title: 'Toyota Hilux SRV 4x4',
    category: 'auto',
    year: 2020,
    km: 82100,
    price: 21000000,
    currency: 'ARS',
    description: 'Pickup diésel, caja manual, cúpula y barras incluidas.',
    published: true,
    sold: false,
    createdAt: '2026-09-28T00:00:00.000Z',
    updatedAt: '2026-09-28T00:00:00.000Z',
    media: [mockPhoto('pickup.jpg')],
  },
  {
    id: 'mock-3',
    title: 'Honda CB 500F',
    category: 'moto',
    year: 2021,
    km: 9800,
    price: 4200000,
    currency: 'ARS',
    description: 'Naked de media cilindrada, impecable estado general.',
    published: true,
    sold: false,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
    media: [mockPhoto('moto-naked.jpg')],
  },
  {
    id: 'mock-4',
    title: 'Yamaha XTZ 250',
    category: 'moto',
    year: 2022,
    km: 5200,
    price: 3600000,
    currency: 'ARS',
    description: 'Trail liviana, ideal para ciudad y ruta.',
    published: true,
    sold: false,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    media: [mockPhoto('moto-trail.jpg')],
  },
  {
    id: 'mock-5',
    title: 'Can-Am Outlander 450',
    category: 'cuatriciclo',
    year: 2022,
    km: 3200,
    price: 9800000,
    currency: 'ARS',
    description: 'Listo para trabajo rural o recreación, tracción 4x4.',
    published: true,
    sold: false,
    createdAt: '2026-09-18T00:00:00.000Z',
    updatedAt: '2026-09-18T00:00:00.000Z',
    media: [mockPhoto('atv.jpg')],
  },
  {
    id: 'mock-6',
    title: 'Trailer de carga 2 ejes',
    category: 'trailer',
    km: undefined,
    price: 2100000,
    currency: 'ARS',
    description: 'Chasis reforzado, luces homologadas, documentación al día.',
    published: true,
    sold: false,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
    media: [mockPhoto('trailer.jpg')],
  },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CarCardComponent],
  template: `
    <!-- HERO -->
    <section class="hero-new">
      <video class="hero-video" autoplay muted loop playsinline>
        <source src="hero-video.mp4" type="video/mp4" />
      </video>
      <div class="hero-overlay"></div>
      <div class="container hero-container">
        <h1 class="hero-title">Autos seleccionados para comprar con tranquilidad</h1>
        <p class="hero-lead">
          Compra, venta y consignación de autos, motos, cuatriciclos y trailers, con atención personalizada y asesoramiento en cada paso.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" routerLink="/autos">Ver vehículos a la venta</a>
          <a class="btn btn-secondary" routerLink="/contacto">Contacto</a>
        </div>
      </div>
      <div class="checker-pattern"></div>
    </section>

    <!-- CATEGORIAS -->
    <section class="categories-section">
      <div class="container">
        <div class="categories-grid">
          @for (c of categories; track c.value) {
            <a class="category-tile" routerLink="/autos" [queryParams]="{ categoria: c.value }">
              <span class="category-name">{{ c.plural }}</span>
              @if (counts()[c.value]; as n) {
                <span class="category-count">{{ n }} {{ n === 1 ? 'disponible' : 'disponibles' }}</span>
              }
            </a>
          }
        </div>
      </div>
    </section>

    <!-- VIDEO -->
    <section class="video-section">
      <div class="container">
        <div class="video-content">
          <div class="video-text">
            <span class="label">Nuestro proceso</span>
            <h2>Cómo compramos y vendemos</h2>
            <p>Te mostramos paso a paso cómo funciona nuestro servicio, desde que elegís tu vehículo hasta que lo tenés en tu poder.</p>
          </div>
          <div class="video-placeholder">
            <svg viewBox="0 0 640 360" aria-hidden="true">
              <rect x="40" y="40" width="560" height="280" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
              <polygon points="240,120 240,240 380,180" fill="currentColor" opacity="0.5"/>
            </svg>
            <span class="placeholder-text">[Embed YouTube o video]</span>
          </div>
          <a class="btn btn-primary" routerLink="/contacto">Conocer más</a>
        </div>
      </div>
    </section>

    <!-- VEHICULOS -->
    @if (latest().length) {
      <section class="vehicles-section">
        <div class="container">
          <div class="vehicles-header">
            <h2>Últimos ingresos</h2>
            <a class="see-all" routerLink="/autos">Ver todos los vehículos →</a>
          </div>
          <div class="cars-grid">
            @for (a of latest(); track a.id) {
              <app-car-card [auto]="a" />
            }
          </div>
        </div>
      </section>
    }

    <!-- SERVICIOS -->
    <section class="services-section">
      <div class="container">
        <div class="services-grid">
          <div class="service-item">
            <h3>Compra y venta</h3>
            <p>Autos, motos, cuatriciclos y trailers listos para entregar.</p>
          </div>
          <div class="service-item">
            <h3>Consignación</h3>
            <p>Vendemos tu vehículo por vos, con fotos, difusión y atención a los interesados.</p>
          </div>
          <div class="service-item">
            <h3>Financiación</h3>
            <p>Opciones a medida, según disponibilidad.</p>
          </div>
          <div class="service-item">
            <h3>Arreglos y puesta a punto</h3>
            <p>Dejamos tu vehículo listo para vender o para el uso diario.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CONSIGNACION CTA -->
    <section class="consignacion-section">
      <div class="container">
        <div class="consignacion-card">
          <div>
            <h2>¿Querés vender tu vehículo?</h2>
            <p>Lo tomamos en consignación: nos encargamos de las fotos, la difusión y la atención a los interesados.</p>
          </div>
          <a class="btn btn-primary" routerLink="/contacto">Consultar ahora</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-new {
      position: relative;
      overflow: hidden;
      background: var(--text);
      color: #fff;
    }

    .hero-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(180deg, rgba(16,24,32,0.78) 0%, rgba(16,24,32,0.6) 55%, rgba(16,24,32,0.92) 100%);
    }

    .hero-new .hero-container {
      position: relative;
      z-index: 2;
      padding: clamp(48px, 8vw, 96px) 20px clamp(120px, 18vw, 200px);
    }

    .hero-title {
      margin: 0 0 0.4em;
      max-width: 17ch;
      font-size: clamp(2.2rem, 6vw, 4rem);
      font-weight: 850;
      line-height: 1.05;
      letter-spacing: -0.01em;
    }

    .hero-lead {
      margin: 0;
      max-width: 48ch;
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 28px;
    }

    .checker-pattern {
      position: relative;
      z-index: 2;
      height: 14px;
      background: repeating-conic-gradient(#ffffff 0 25%, #101820 0 50%) 0 0 / 28px 28px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .categories-section {
      padding: 40px 20px 8px;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      max-width: 1120px;
      margin: 0 auto;

      @media (max-width: 860px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @media (max-width: 560px) {
        grid-template-columns: 1fr;
      }
    }

    .category-tile {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 18px;
      min-height: 112px;
      padding: 18px 20px;
      background: #ffffff;
      border: 1px solid #D6DCE3;
      border-left: 5px solid var(--primary);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      transition: border-color 0.15s, background-color 0.15s;

      &:hover {
        border-color: var(--text);
        border-left-color: var(--primary);
        background: #F5F7F9;
      }
    }

    .category-name {
      font-size: 1.3rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .category-count {
      font-size: 14px;
      color: #5A6673;
    }

    .video-section {
      padding: 56px 20px;
      background: #ffffff;
      border-bottom: 1px solid #D6DCE3;

      .container {
        max-width: 1120px;
        margin: 0 auto;
      }
    }

    .video-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      text-align: center;
    }

    .video-text {
      max-width: 640px;

      .label {
        color: var(--primary);
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      h2 {
        margin: 8px 0 12px;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.01em;
      }

      p {
        margin: 0;
        color: #5A6673;
        font-size: 15px;
        line-height: 1.6;
      }
    }

    .video-placeholder {
      width: 100%;
      max-width: 800px;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #D6DCE3;
      box-shadow: 0 4px 12px rgba(16, 24, 32, 0.08);
      background: #F5F7F9;
      display: grid;
      place-items: center;
      position: relative;
      color: #B9C2CC;

      svg {
        width: 40%;
        height: 40%;
      }

      .placeholder-text {
        position: absolute;
        font-size: 12px;
        color: #8C8F94;
        bottom: 12px;
        right: 12px;
      }
    }

    .vehicles-section {
      padding: 48px 20px 56px;
    }

    .vehicles-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      max-width: 1120px;
      margin-left: auto;
      margin-right: auto;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -0.01em;
      }
    }

    .see-all {
      color: var(--primary);
      font-weight: 650;
      text-decoration: none;
      transition: color 0.15s;

      &:hover {
        color: var(--primary-hover);
      }
    }

    .cars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 20px;
      max-width: 1120px;
      margin: 0 auto;
    }

    .services-section {
      padding: 12px 20px 56px;

      .container {
        max-width: 1120px;
        margin: 0 auto;
      }
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px 32px;

      @media (max-width: 960px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @media (max-width: 560px) {
        grid-template-columns: 1fr;
      }
    }

    .service-item {
      border-top: 2px solid var(--text);
      padding-top: 16px;

      h3 {
        margin: 0 0 0.5em;
        font-size: 1.05rem;
        font-weight: 700;
      }

      p {
        margin: 0;
        color: #5A6673;
        font-size: 14.5px;
        max-width: 32ch;
      }
    }

    .consignacion-section {
      padding: 0 20px 56px;

      .container {
        max-width: 1120px;
        margin: 0 auto;
      }
    }

    .consignacion-card {
      background: #ffffff;
      border: 1px solid #D6DCE3;
      border-radius: 12px;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;

      h2 {
        margin: 0 0 10px;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -0.01em;
      }

      p {
        margin: 0;
        color: #5A6673;
        font-size: 15px;
        line-height: 1.6;
      }

      @media (max-width: 860px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font: inherit;
      font-weight: 650;
      font-size: 15px;
      line-height: 1.2;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid transparent;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s, border-color 0.15s;

      &.btn-primary {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);

        &:hover {
          background: var(--primary-hover);
          border-color: var(--primary-hover);
        }
      }

      &.btn-secondary {
        background: transparent;
        color: #fff;
        border-color: rgba(255, 255, 255, 0.5);

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #fff;
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 20px;
    }
  `],
})
export class HomePage {
  private readonly api = inject(ApiService);
  readonly latest = signal<Auto[]>([]);
  readonly categories = CATEGORIES;
  readonly counts = signal<Record<string, number>>({});

  constructor() {
    this.api.listAutosPublicos().subscribe({
      next: (autos) => this.apply([...autos, ...MOCK_VEHICLES]),
      error: () => this.apply(MOCK_VEHICLES),
    });
  }

  private apply(autos: Auto[]): void {
    this.latest.set(autos.slice(0, 7));
    const c: Record<string, number> = {};
    for (const a of autos) c[a.category ?? 'auto'] = (c[a.category ?? 'auto'] ?? 0) + 1;
    this.counts.set(c);
  }
}
