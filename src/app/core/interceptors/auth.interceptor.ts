import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

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
    '/image-upload/version'
  ];

  const isPublic = publicUrls.some(url => req.url.includes(url));

  let request = req;

  // Add Authorization header only for protected APIs
  if (!isPublic && token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(

    catchError((error) => {

      if (
        (error.status === 401 || error.status === 403 || error.status === 0)
        && !isRedirecting
      ) {

        console.log("Calling logout()");

        isRedirecting = true;

        authService.logout(false);

      }

      return throwError(() => error);

    })

  );

};