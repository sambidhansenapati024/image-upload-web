import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  let isRedirecting = false;

  const tokenService = inject(TokenService);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  const token = tokenService.getToken();

const publicUrls = [
  '/auth/login',
  '/auth/register',
  '/image-upload/version'
];

const isPublic = publicUrls.some(url => req.url.includes(url));

if (isPublic || !token) {
  return next(req);
}

  // Add Authorization header
  const authRequest = req.clone({

    setHeaders: {
      Authorization: `Bearer ${token}`
    }

  });

  return next(authRequest).pipe(

  catchError((error) => {

if (error.status === 401 && !isRedirecting) {

  isRedirecting = true;

  authService.logout();

}

    return throwError(() => error);

  })

);

};