import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Auto } from './api.service';

export type PublicationPayload = {
  id: string;
  title: string;
  text: string;
  targets: {
    instagramFeed: string;
    instagramStory: string;
    whatsappStatus: string;
    mercadolibre: string;
  };
  mediaCount: number;
};

export type PublishTarget = 'instagram' | 'mercadolibre' | 'whatsapp';
export type InstagramPlacement = 'feed' | 'story';

export type PublishStatus = 'mocked' | 'published' | 'paused' | 'closed' | 'error';

export type PublishLogEntry = {
  id: string;
  autoId: string;
  target: PublishTarget;
  placement?: InstagramPlacement;
  status: PublishStatus;
  externalId?: string;
  url?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
};

export type PublishResponse = {
  ok: boolean;
  mode: 'mock' | 'real';
  publication: PublishLogEntry;
};

export type IntegrationsStatus = {
  mode: 'mock' | 'real';
  publicBaseUrl: string | null;
  instagram: { enabled: boolean; connected: boolean };
  mercadolibre: { enabled: boolean; connected: boolean; expiresAt: string | null; redirectUri: string };
};

export type MercadoLibreAutoStatus = 'available' | 'reserved' | 'sold';

export type MarketItem = {
  id: string;
  title: string;
  price: string;
  year: string;
  kms: string;
  location: string;
  imageUrl: string;
  link: string;
  phone?: string;
  scrapedAt: string;
};

export type PriceAlert = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  active: boolean;
  createdAt: string;
};

export type MarketResults = { items: MarketItem[]; total: number; lastRun: string | null };

export type ScraperRunResult = {
  total: number;
  source: 'live' | 'last-report';
  alertMatches: number;
  matches: { alert: string; item: MarketItem }[];
};

export type CotizPoint = {
  price_usd: number | null;
  price_ars: number | null;
  link: string;
  title: string;
  kms: string;
};

export type CotizResult = {
  brand: string;
  model: string;
  year: string;
  usd_rate: number | null;
  sources: { count?: number; outliers_removed?: number; error?: string }[];
  global_min: CotizPoint | null;
  global_max: CotizPoint | null;
  global_avg_usd: number | null;
  global_avg_ars: number | null;
};

export type MarketConfig = { baseUrl: string; maxPages: number | null; filters: Record<string, unknown> };

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly baseUrl = 'http://localhost:3001';

  constructor(private readonly http: HttpClient) {}

  listAutos(): Observable<Auto[]> {
    return this.http.get<Auto[]>(`${this.baseUrl}/api/admin/autos`);
  }

  createAuto(payload: Partial<Auto> & { title: string }): Observable<Auto> {
    return this.http.post<Auto>(`${this.baseUrl}/api/admin/autos`, payload);
  }

  updateAuto(id: string, patch: Partial<Auto>): Observable<Auto> {
    return this.http.put<Auto>(`${this.baseUrl}/api/admin/autos/${id}`, patch);
  }

  deleteAuto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/autos/${id}`);
  }

  uploadMedia(autoId: string, file: File): Observable<Auto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Auto>(`${this.baseUrl}/api/admin/autos/${autoId}/media`, form);
  }

  getPublication(autoId: string): Observable<PublicationPayload> {
    return this.http.get<PublicationPayload>(`${this.baseUrl}/api/admin/autos/${autoId}/publication`);
  }

  getMediaZipUrl(autoId: string): string {
    return `${this.baseUrl}/api/admin/autos/${autoId}/media.zip`;
  }

  publishAuto(autoId: string, target: PublishTarget, placement?: InstagramPlacement): Observable<PublishResponse> {
    return this.http.post<PublishResponse>(`${this.baseUrl}/api/admin/autos/${autoId}/publish`, {
      target,
      placement,
    });
  }

  listPublications(): Observable<PublishLogEntry[]> {
    return this.http.get<PublishLogEntry[]>(`${this.baseUrl}/api/admin/publications`);
  }

  getIntegrations(): Observable<IntegrationsStatus> {
    return this.http.get<IntegrationsStatus>(`${this.baseUrl}/api/admin/integrations`);
  }

  getIntegrationAuthUrl(platform: 'mercadolibre' | 'instagram'): Observable<{ authUrl: string }> {
    return this.http.get<{ authUrl: string }>(`${this.baseUrl}/api/admin/integrations/${platform}/auth`);
  }

  setMercadoLibreStatus(autoId: string, status: MercadoLibreAutoStatus) {
    return this.http.put<{ ok: boolean; mlStatus: string; externalId: string }>(
      `${this.baseUrl}/api/admin/autos/${autoId}/mercadolibre/status`,
      { status }
    );
  }

  // --- Monitor de mercado ---
  getMarketResults(): Observable<MarketResults> {
    return this.http.get<MarketResults>(`${this.baseUrl}/api/admin/market/results`);
  }

  runScraper(): Observable<ScraperRunResult> {
    return this.http.post<ScraperRunResult>(`${this.baseUrl}/api/admin/market/run`, {});
  }

  cotizar(brand: string, model: string, year?: string): Observable<CotizResult> {
    const params: Record<string, string> = { brand, model };
    if (year) params['year'] = year;
    return this.http.get<CotizResult>(`${this.baseUrl}/api/admin/market/cotizar`, { params });
  }

  listAlerts(): Observable<PriceAlert[]> {
    return this.http.get<PriceAlert[]>(`${this.baseUrl}/api/admin/market/alerts`);
  }

  createAlert(alert: Partial<PriceAlert> & { name: string }): Observable<PriceAlert> {
    return this.http.post<PriceAlert>(`${this.baseUrl}/api/admin/market/alerts`, alert);
  }

  updateAlert(id: string, patch: Record<string, unknown>): Observable<PriceAlert> {
    return this.http.put<PriceAlert>(`${this.baseUrl}/api/admin/market/alerts/${id}`, patch);
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/market/alerts/${id}`);
  }

  getMarketConfig(): Observable<MarketConfig> {
    return this.http.get<MarketConfig>(`${this.baseUrl}/api/admin/market/config`);
  }

  updateMarketConfig(config: { baseUrl?: string; maxPages?: number }): Observable<MarketConfig> {
    return this.http.put<MarketConfig>(`${this.baseUrl}/api/admin/market/config`, config);
  }
}
