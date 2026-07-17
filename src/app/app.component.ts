import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { VersionServiceService } from './service/version-service.service';
import { UpdateToastComponent } from "./components/update-toast/update-toast.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

@Component({
  selector: 'app-root',
  imports: [ImageUploadComponent, UpdateToastComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'image-upload-web';

  visible = false;

  countdown = 10;

  constructor(public versionService: VersionServiceService){}

  ngOnInit(){

    this.versionService.startVersionCheck();

    this.versionService.showToast.subscribe(v => {

      this.visible = v;

    });

    this.versionService.countdown.subscribe(v => {

      this.countdown = v;

    });

  }

  reloadNow(){

    window.location.reload();

  }
}
