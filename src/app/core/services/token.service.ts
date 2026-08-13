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

}