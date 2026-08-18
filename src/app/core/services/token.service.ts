import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;

  constructor(
    private storageService: StorageService
  ) {}

  // =========================
  // ACCESS TOKEN
  // =========================

  saveToken(token: string): void {

    this.storageService.save(
      this.TOKEN_KEY,
      token
    );

  }

  getToken(): string | null {

    return this.storageService.get(
      this.TOKEN_KEY
    );

  }

  // =========================
  // LOGIN CHECK
  // =========================

  hasToken(): boolean {

    return this.getToken() !== null;

  }

  // =========================
  // CLEAR TOKENS
  // =========================

  clearToken(): void {

    this.storageService.remove(
      this.TOKEN_KEY
    );
  }

  getUserType(): 'USER' | 'ADMIN' | null {

  const token = this.getToken();

  if (!token) {
    return null;
  }

  try {

    const payload = JSON.parse(
      atob(
        token.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    );

    const userType = payload?.userType;

    if (
      userType === 'USER' ||
      userType === 'ADMIN'
    ) {
      return userType;
    }

    return null;

  } catch (error) {

    console.error(
      'Failed to read userType from access token:',
      error
    );

    return null;

  }

}

}