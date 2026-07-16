import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { VersionServiceService } from './service/version-service.service';

@Component({
  selector: 'app-root',
  imports: [ ImageUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'image-upload-web';

  constructor(private versionService: VersionServiceService) {}

  ngOnInit(): void {
    this.versionService.startVersionCheck();
  }
}
