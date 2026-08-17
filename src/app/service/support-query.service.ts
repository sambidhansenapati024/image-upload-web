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

}