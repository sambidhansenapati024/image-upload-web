import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { LoginRequest } from '../../shared/modal/login-request';
import { LoginResponse } from '../../shared/modal/login-response';
import { Observable, tap } from 'rxjs';
import { RegisterRequest } from '../../shared/modal/register-request';
import { RegisterResponse } from '../../shared/modal/register-response';
import { CurrentUserService } from '../../service/current-user.service';
import { ChangePasswordRequest } from '../../shared/modal/change-password-request';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { resetRedirectFlag } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private readonly AUTH_API = `${environment.apiUrl}/auth`;

  constructor( private http: HttpClient,
    private tokenService: TokenService,
   private currentUserService: CurrentUserService,
   private router: Router,
  private messageService: MessageService) { }

     register(request: RegisterRequest): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.AUTH_API}/register`,
      request
    );

  }

  login(request: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.AUTH_API}/login`,
      request
    ).pipe(

      tap(response => {

  if (response.success) {

    this.tokenService.saveToken(response.token);

    this.currentUserService.loadCurrentUser();

  }

})

    );

  }

logout(showMessage: boolean = true): void {

  this.tokenService.clearToken();
  this.currentUserService.clearCurrentUser();

  this.router.navigate(['/login']).then(() => {
    resetRedirectFlag();
  });


}

isLoggedIn(): boolean {

  return this.tokenService.hasToken();

}

  getToken(): string | null {

    return this.tokenService.getToken();

  }

  changePassword(request: ChangePasswordRequest): Observable<string> {

  return this.http.post(
    `${environment.apiUrl}/users/change-password`,
    request,
    {
      responseType: 'text'
    }
  );

}

forgotPassword(email: string) {
  return this.http.post(
    `${environment.apiUrl}/auth/forgot-password`,
    { email },
    { responseType: 'text' }
  );
}

resetPassword(token: string, password: string) {
  return this.http.post(
    `${environment.apiUrl}/auth/reset-password`,
    {
      token,
      password
    },
    {
      responseType: 'text'
    }
  );
}
}
