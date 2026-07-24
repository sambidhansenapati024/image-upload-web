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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private readonly AUTH_API = `${environment.apiUrl}/auth`;

  constructor( private http: HttpClient,
    private tokenService: TokenService,
   private currentUserService: CurrentUserService) { }

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

logout(): void {

  this.tokenService.clearToken();

}

isLoggedIn(): boolean {

  return this.tokenService.hasToken();

}

  getToken(): string | null {

    return this.tokenService.getToken();

  }
}
