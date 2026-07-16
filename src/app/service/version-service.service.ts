import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionServiceService {

   private currentVersion = '';
   constructor(private http: HttpClient) {}

     startVersionCheck(): void {

    // Read current version once
    this.http.get<any>('/version.json').subscribe(version => {
      this.currentVersion = version.version;
      console.log('Current Version:', this.currentVersion);
    });

    // Check every 30 seconds
    interval(30000).subscribe(() => {

      this.http.get<any>('/version.json?ts=' + new Date().getTime())
        .subscribe(version => {

          if (
            this.currentVersion &&
            version.version !== this.currentVersion
          ) {

            alert('🚀 New version deployed. Refreshing...');

            setTimeout(() => {
              window.location.reload();
            }, 5000);

          }

        });

    });

  }
}
