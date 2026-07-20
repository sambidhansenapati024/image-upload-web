import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Button } from "primeng/button";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CardModule, TagModule, ConfirmDialogModule, ToastModule, Button],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() version = 'v1.0.0';

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
) {}

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
