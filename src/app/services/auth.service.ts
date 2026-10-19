import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:3001';
  private readonly tokenKey = 'jyg_token';

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.baseUrl}/api/auth/login`, { username, password })
      .pipe(tap((r) => localStorage.setItem(this.tokenKey, r.token)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
