import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideHttpClient(
  withInterceptors([
    authInterceptor
  ])
),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    ConfirmDialogModule,
    ToastModule,
    ButtonModule, ConfirmationService, MessageService
  ]
};