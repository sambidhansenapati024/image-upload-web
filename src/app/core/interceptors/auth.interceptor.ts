import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);

  const token = tokenService.getToken();

const publicUrls = [
  '/auth/login',
  '/auth/register'
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

  return next(authRequest);

};