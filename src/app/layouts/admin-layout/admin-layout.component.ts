import { Component, OnInit, ViewChild } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { CurrentUserService } from '../../service/current-user.service';
import { Profile } from '../../shared/modal/profile';
import { Popover, PopoverModule } from 'primeng/popover';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
imports: [
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  PopoverModule
],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {

  @ViewChild('adminPopover')
adminPopover!: Popover;

  user: Profile | null = null;

  constructor(
  private router: Router,
  private currentUserService: CurrentUserService,
  private authService: AuthService,
  private confirmationService: ConfirmationService
) {}

  ngOnInit(): void {

    this.currentUserService.currentUser$
      .subscribe(user => {

        this.user = user;

      });

  }

  switchToUser(): void {

    this.router.navigate(['/home']);

  }

  goToProfile(): void {

  this.adminPopover.hide();

  this.router.navigate(['/profile']);

}

goToSettings(): void {

  this.adminPopover.hide();

  this.router.navigate(['/settings']);

}

goToSecurity(): void {

  this.adminPopover.hide();

  this.router.navigate(['/security']);

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

    }

  });

}

}