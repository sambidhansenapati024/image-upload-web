import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionServiceService {

  private frontendVersion = '';
  private backendVersion = '';

  showToast = new BehaviorSubject<boolean>(false);
  countdown = new BehaviorSubject<number>(5);

  private timerStarted = false;

  constructor(private http: HttpClient) {}

  startVersionCheck(): void {

  // Read both versions once
  forkJoin({
    frontend: this.http.get<any>('/version.json'),
    backend: this.http.get<any>('http://13.127.244.157:2627/image-upload/version')
  }).subscribe(res => {

    this.frontendVersion = res.frontend.version;
    this.backendVersion = res.backend.version;

  });

  // Check every 5 minutes
  interval(5 * 60 * 1000).subscribe(() => {

    this.checkVersion();

  });

}

private checkVersion(): void {

  forkJoin({
    frontend: this.http.get<any>('/version.json?ts=' + Date.now()),
    backend: this.http.get<any>('http://13.127.244.157:2627/image-upload/version?ts=' + Date.now())
  }).subscribe(res => {

    const frontendChanged =
      res.frontend.version !== this.frontendVersion;

    const backendChanged =
      res.backend.version !== this.backendVersion;

    if ((frontendChanged || backendChanged) && !this.timerStarted) {

      this.timerStarted = true;

      this.showToast.next(true);

      let seconds = 10;

      this.countdown.next(seconds);

      const timer = setInterval(() => {

        seconds--;

        this.countdown.next(seconds);

        if (seconds <= 0) {

          clearInterval(timer);

          window.location.reload();

        }

      }, 1000);

    }

  });

}

}