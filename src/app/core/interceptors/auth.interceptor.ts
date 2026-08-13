import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRedirecting = false;

export function resetRedirectFlag() {
  isRedirecting = false;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getToken();

  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/image-upload/version'
  ];

  const isPublic =
    publicUrls.some(url => req.url.includes(url));

  let request = req;

  // Add access token to protected requests
  if (!isPublic && token) {

    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  return next(request).pipe(

    catchError((error: HttpErrorResponse) => {

      // Only try refresh for 401
      if (
        error.status === 401 &&
        !isPublic &&
        !isRedirecting
      ) {

        console.log(
          'Access token expired. Trying refresh...'
        );
        return authService.refreshToken().pipe(

          switchMap(response => {

            if (!response.success ||
              !response.token ) {

              authService.logout(false);

              return throwError(() => error);

            }

            console.log(
              'Token refreshed successfully'
            );

            // Save new access token
            tokenService.saveToken(
              response.token
            );

            // Retry original request
            const retryRequest =
              req.clone({
                setHeaders: {
                  Authorization:
                    `Bearer ${response.token}`
                }
              });

            return next(retryRequest);

          }),

          catchError(refreshError => {

            console.error(
              'Refresh token failed',
              refreshError
            );

            authService.logout(false);

            return throwError(
              () => refreshError
            );

          })

        );

      }

      // Keep existing behavior for other
      // authentication failures
      if (
        (error.status === 403 ||
          error.status === 0) &&
        !isRedirecting
      ) {

        isRedirecting = true;

        authService.logout(false);

      }

      return throwError(() => error);

    })

  );

};