import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface SupportQueryRequest {
  query: string;
  requestId: string;
  queryType: 'PASSWORD' | 'IMAGE_UPLOAD' | 'RECYCLE_BIN' | 'OTHER';
}

export interface SupportQueryResponse {
  success: boolean;
  message: string;
  queryId: number | null;
}

export interface SupportQueryListResponse {
  queryId: number;
  queryType:
    | 'PASSWORD'
    | 'IMAGE_UPLOAD'
    | 'RECYCLE_BIN'
    | 'OTHER';
  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED';
  query: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportQueryTimelineResponse {
  status:
    | 'RAISED'
    | 'RECEIVED'
    | 'ASSISTANT_ASSIGNED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CLOSED';

  changedAt: string;
}

export interface AdminSupportQueryResponse {

  queryId: number;

  userId: number;

  userName: string;

  userEmail: string;

  queryType:
    | 'PASSWORD'
    | 'IMAGE_UPLOAD'
    | 'RECYCLE_BIN'
    | 'OTHER';

  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED';

  query: string;

  createdAt: string;

  updatedAt: string;
}

export interface SupportQueryDetailsResponse {
  queryId: number;

  queryType:
    | 'PASSWORD'
    | 'IMAGE_UPLOAD'
    | 'RECYCLE_BIN'
    | 'OTHER';

  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED';

  query: string;

  createdAt: string;

  updatedAt: string;

  timeline: SupportQueryTimelineResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class SupportQueryService {

  private readonly API =
    `${environment.apiUrl}/support/queries`;

    private readonly ADMIN_API =
       `${environment.apiUrl}/admin/support/queries`;

  constructor(
    private http: HttpClient
  ) {}

  createQuery(
    request: SupportQueryRequest
  ): Observable<SupportQueryResponse> {

    return this.http.post<SupportQueryResponse>(
      this.API,
      request
    );

  }

  getMyQueries(): Observable<SupportQueryListResponse[]> {

  return this.http.get<SupportQueryListResponse[]>(
    `${this.API}/myQueries`
  );

}

getMyQueryDetails(
  queryId: number
): Observable<SupportQueryDetailsResponse> {

  return this.http.get<SupportQueryDetailsResponse>(
    `${this.API}/myQueriesById/${queryId}`
  );

}

getAllAdminQueries(): Observable<AdminSupportQueryResponse[]> {

  return this.http.get<AdminSupportQueryResponse[]>(
    `${environment.apiUrl}/admin/support/queries`
  );

}

getAdminQueryById(
  queryId: number
): Observable<AdminSupportQueryResponse> {

  return this.http.get<AdminSupportQueryResponse>(
    `${this.ADMIN_API}/${queryId}`
  );

}

sendAdminPasswordResetLink(
  queryId: number
): Observable<void> {

  return this.http.post<void>(
    `${this.ADMIN_API}/${queryId}/send-reset-link`,
    {}
  );

}

}