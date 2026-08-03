import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionServiceService } from './service/version-service.service';
import { UpdateToastComponent } from "./shared/update-toast/update-toast.component";
import { DashboardComponent } from "./feature/dashboard/dashboard.component";
import { Toast } from "primeng/toast";
import { ConfirmDialog } from "primeng/confirmdialog";
import { CurrentUserService } from './service/current-user.service';
import { AuthService } from './core/services/auth.service';
import { NotificationWebsocketService } from './service/notification-websocket.service';
import { NotificationService } from './service/notification.service';

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
  private currentUserService: CurrentUserService,
  private notificationWebSocketService: NotificationWebsocketService,
  private notificationService: NotificationService,
  ){}

  ngOnInit(){
 console.log('isLoggedIn:', this.authService.isLoggedIn());

  if (this.authService.isLoggedIn()) {

    console.log('Loading notifications...');

    this.currentUserService.loadCurrentUser();
    this.notificationService.loadNotifications();
    this.notificationWebSocketService.connect();
  }
  
    //this.versionService.startVersionCheck();

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
