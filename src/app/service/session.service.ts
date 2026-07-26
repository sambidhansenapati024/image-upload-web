import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionResponse } from '../shared/modal/ession-response';
import { LogoutSessionRequest } from '../shared/modal/logout-session-request';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly USER_API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getActiveSessions(): Observable<SessionResponse[]> {

    return this.http.get<SessionResponse[]>(
      `${this.USER_API}/sessions`
    );

  }

  logoutSession(request: LogoutSessionRequest): Observable<void> {

    return this.http.post<void>(
      `${this.USER_API}/logout-session`,
      request
    );

  }

  logoutOtherSessions(): Observable<void> {

  return this.http.post<void>(
    `${this.USER_API}/logout-other-sessions`,
    {}
  );

}
}
