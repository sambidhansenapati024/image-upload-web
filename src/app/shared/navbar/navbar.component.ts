import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Button } from "primeng/button";
import { Profile } from '../modal/profile';
import { CurrentUserService } from '../../service/current-user.service';
import { VersionServiceService } from '../../service/version-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CardModule, TagModule, ConfirmDialogModule, Button],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() version = 'v1.0.0';

  user: Profile | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private currentUserService: CurrentUserService,
    public versionService: VersionServiceService
) {}

ngOnInit(): void {

  this.currentUserService.currentUser$.subscribe(user => {

    this.user = user;

  });

}

logout(): void {

    this.confirmationService.confirm({

        header: 'Logout',

        message: 'Are you sure you want to logout?',

        icon: 'pi pi-sign-out',

        acceptLabel: 'Yes',

        rejectLabel: 'Cancel',

        accept: () => {

            this.authService.logout();

            this.messageService.add({

                severity: 'success',

                summary: 'Logged Out',

                detail: 'You have been logged out successfully.'

            });

            this.router.navigate(['/login']);

        }

    });

}
}
