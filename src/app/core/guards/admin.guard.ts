import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { TokenService } from '../services/token.service';

export const adminGuard: CanActivateFn = () => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  const userType =
    tokenService.getUserType();

  if (userType === 'ADMIN') {

    return true;

  }

  return router.createUrlTree([
    '/home'
  ]);

};