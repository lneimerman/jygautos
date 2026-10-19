import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Category } from '../categories';

export type AutoMedia = {
  id: string;
  type: 'image' | 'video';
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type Auto = {
  id: string;
  title: string;
  category: Category;
  brand?: string;
  model?: string;
  year?: number;
  km?: number;
  price?: number;
  currency?: string;
  description?: string;
  repairedServices?: string;
  contactPhone?: string;
  published: boolean;
  sold: boolean;
  createdAt: string;
  updatedAt: string;
  media: AutoMedia[];
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:3001';

  constructor(private readonly http: HttpClient) {}

  listAutosPublicos(): Observable<Auto[]> {
    return this.http.get<Auto[]>(`${this.baseUrl}/api/autos`);
  }

  getAutoPublico(id: string): Observable<Auto> {
    return this.http.get<Auto>(`${this.baseUrl}/api/autos/${id}`);
  }
}
