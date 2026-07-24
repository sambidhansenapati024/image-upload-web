import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionServiceService } from './service/version-service.service';
import { UpdateToastComponent } from "./shared/update-toast/update-toast.component";
import { DashboardComponent } from "./feature/dashboard/dashboard.component";
import { Toast } from "primeng/toast";
import { ConfirmDialog } from "primeng/confirmdialog";
import { CurrentUserService } from './service/current-user.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'image-upload-web';

  visible = false;

  countdown = 10;

  constructor(public versionService: VersionServiceService,
    private authService: AuthService,
  private currentUserService: CurrentUserService
  ){}

  ngOnInit(){

      if (this.authService.isLoggedIn()) {
    this.currentUserService.loadCurrentUser();
  }
  
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
