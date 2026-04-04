import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  fullName: string;
  mobileNumber: string;
  age: number;
  profileComplete: boolean;
}

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  constructor() {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this._token.set(savedToken);
      this.fetchMe();
    }
  }

  async fetchMe() {
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${this._token()}` },
      });

      if (res.status === 401) {
        this.logout();
        return;
      }

      const json = await res.json();
      this._user.set(json.data);
    } catch {}
  }
  setSession(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);
    localStorage.setItem('token', token);
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
  }

  async register(formData: FormData) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      throw { status: res.status, error: json };
    }

    return json as { data: { user: User; token: string } };
  }
}
