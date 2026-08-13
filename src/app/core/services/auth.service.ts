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
import { NotificationWebsocketService } from '../../service/notification-websocket.service';
import { NotificationService } from '../../service/notification.service';
import { OtpResponse } from '../../shared/modal/OtpResponse';
import { CompleteRegistrationRequest } from '../../shared/modal/complete-registration-request';
import { ResendOtpRequest } from '../../shared/modal/resend-otp-request';
import { RefreshTokenResponse } from '../../shared/modal/refresh-token-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private readonly AUTH_API = `${environment.apiUrl}/auth`;
 private readonly OTP_API = `${environment.apiUrl}/otp`;

  constructor( private http: HttpClient,
    private tokenService: TokenService,
   private currentUserService: CurrentUserService,
   private router: Router,
  private messageService: MessageService,
private notificationWebSocketService : NotificationWebsocketService,
 private notificationService: NotificationService,
) { }

     register(request: RegisterRequest): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.AUTH_API}/register`,
      request
    );

  }

  login(request: LoginRequest): Observable<LoginResponse> {

  return this.http.post<LoginResponse>(
    `${this.AUTH_API}/login`,
    request,
    {
      withCredentials: true
    }
  ).pipe(

    tap(response => {

      if (response.success) {

        this.tokenService.saveToken(
          response.token
        );

        this.currentUserService.loadCurrentUser();
        this.notificationService.loadNotifications();
        this.notificationWebSocketService.connect();

      }

    })

  );

}

logout(showMessage: boolean = true): void {

    this.notificationWebSocketService.disconnect();

    this.http.post(
        `${this.AUTH_API}/logout`,
        {},
        {
            withCredentials: true
        }
    ).subscribe({

        next: () => {

            console.log(
                'Backend logout successful'
            );

            if (showMessage) {

                this.messageService.add({

                    severity: 'success',

                    summary: 'Logged Out',

                    detail:
                        'You have been logged out successfully.'

                });

            }

            this.completeLogout();

        },

        error: (error) => {

            console.error(
                'Backend logout failed:',
                error
            );

            // Even if backend is unavailable,
            // clear local authentication.
            this.completeLogout();

        }

    });
}

private completeLogout(): void {

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

 sendOtp(request: RegisterRequest): Observable<OtpResponse> {

  return this.http.post<OtpResponse>(
    `${this.OTP_API}/send-otp`,
    request
  );

}

registerComplete(request: CompleteRegistrationRequest): Observable<RegisterResponse> {

  return this.http.post<RegisterResponse>(
    `${this.AUTH_API}/register`,
    request
  );

}

resendOtp(request: ResendOtpRequest): Observable<OtpResponse> {

    return this.http.post<OtpResponse>(
        `${this.OTP_API}/resend-otp`,
        request
    );

}

refreshToken(): Observable<RefreshTokenResponse> {

  return this.http.post<RefreshTokenResponse>(
    `${this.AUTH_API}/refresh`,
    {},
    {
      withCredentials: true
    }
  );

}

}
