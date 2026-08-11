import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../shared/modal/dashboard-stats';
import { ImageResponse } from '../shared/modal/image-response';
import { HttpParams } from '@angular/common/http';
import { PageResponse } from '../shared/modal/page-response';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadServiceService {
  private readonly api = environment.apiUrl + '/image-upload';
  private readonly image_studio_api = environment.apiUrl + '/collage';

  constructor(private http: HttpClient) { }

  upload(files: File[]): Observable<HttpEvent<any>> {

    const formData = new FormData();

    files.forEach(file => {

      formData.append('file', file);

    });

    return this.http.post<any>(
      `${this.api}/upload`,
      formData,
      {
        observe: 'events',
        reportProgress: true
      }
    );

  }

  getImages(
    page: number,
    size: number,
    search: string,
    sortBy: string,
    direction: string
  ): Observable<PageResponse<ImageResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PageResponse<ImageResponse>>(
      this.api,
      { params }
    );

  }

  deleteImage(fileName: string): Observable<string> {

    return this.http.delete(
      `${this.api}/${fileName}`,
      {
        responseType: 'text'
      }
    );

  }

  getDashboardStats() {

    return this.http.get<DashboardStats>(
      this.api + "/stats"
    );

  }

  downloadImage(fileName: string) {

    return this.http.get(
      `${this.api}/${fileName}`,
      {
        responseType: 'blob'
      }
    );

  }

  getDeletedImages(
    page: number,
    size: number,
    search: string,
    sortBy: string,
    direction: string
  ) {
    return this.http.get<any>(
      `${this.api}/recycle-bin`,
      {
        params: {
          page,
          size,
          search,
          sortBy,
          direction
        }
      }
    );
  }

  restoreImage(id: number) {
    return this.http.put(
      `${this.api}/restore/${id}`,
      {}
    );
  }

  permanentlyDelete(id: number) {
    return this.http.delete(
      `${this.api}/permanent/${id}`
    );
  }

  saveEditedImage(
    imageId: number,
    image: Blob
  ): Observable<ImageResponse> {

    const formData = new FormData();

    formData.append(
      'file',
      image,
      'edited-image.png'
    );

    return this.http.post<ImageResponse>(
      `${this.api}/edit/${imageId}`,
      formData
    );

  }

  replaceImage(imageId: number, formData: FormData) {

  return this.http.put<ImageResponse>(
    `${this.api}/replace/${imageId}`,
    formData
  );

}

copyImage(imageId: number, formData: FormData) {

  return this.http.post<ImageResponse>(
    `${this.api}/copy/${imageId}`,
    formData
  );

}

   uploadCollage(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(
      `${this.image_studio_api}/upload`,
      formData
    );
  }

  uploadCompress(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(
      `${this.image_studio_api}/upload`,
      formData
    );
  }
  

}
