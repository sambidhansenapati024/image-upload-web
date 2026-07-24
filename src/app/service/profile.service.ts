import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '../shared/modal/profile';
import { environment } from '../../environments/environment';
import { ProfileUpdateRequest } from '../shared/modal/ProfileUpdateRequest';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/modal/api-response';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get<Profile>(
      environment.apiUrl + '/profile/me'
    );
  }

updateProfile(request: ProfileUpdateRequest): Observable<ApiResponse> {
  return this.http.put<any>(
    `${environment.apiUrl}/profile/update`,
    request
  );
}

uploadProfileImage(file: File) {

  const formData = new FormData();

  formData.append('file', file);

  return this.http.post<any>(
    `${environment.apiUrl}/profile/image`,
    formData
  );

}
}
