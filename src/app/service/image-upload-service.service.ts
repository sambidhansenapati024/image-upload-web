import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadServiceService {
  private api = environment.apiUrl + '/image-upload';

  constructor(private http : HttpClient) { }

  upload(file : File ): Observable<HttpEvent<any>>{
    const formData = new FormData;
    formData.append('file',file);

    return this.http.post<any>(
      `${this.api}/upload`,
      formData,
      {
        observe:'events',
        reportProgress:true
      }
    );
  }

  getAllImage():Observable<string[]>{
    return this.http.get<string[]>(`${this.api}/getAll`)
  }

  deleteImage(fileName: string){
    return this.http.delete(`${this.api}/${fileName}`,{
      responseType :'text'
    });
  }


}
