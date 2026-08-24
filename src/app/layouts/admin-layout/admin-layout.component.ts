import { Component, OnInit, ViewChild } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  trigger,
  transition,
  style,
  query,
  animate
} from '@angular/animations';

import { CurrentUserService } from '../../service/current-user.service';
import { Profile } from '../../shared/modal/profile';

import {
  Popover,
  PopoverModule
} from 'primeng/popover';

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

  animations: [

    trigger('routeAnimations', [

      transition('* <=> *', [

        query(
          ':enter',
          [
            style({
              opacity: 0,
              transform: 'translateY(8px)'
            }),

            animate(
              '280ms cubic-bezier(.22, 1, .36, 1)',
              style({
                opacity: 1,
                transform: 'translateY(0)'
              })
            )
          ],
          {
            optional: true
          }
        )

      ])

    ])

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


  /*
   * Used by the route animation.
   *
   * The router URL changes whenever the user switches
   * between Dashboard, Support Queries, etc.
   */
  getRouteAnimationData(): string {

    return this.router.url;

  }


  /*
   * Switch from Admin panel back to
   * the normal user application.
   */
  switchToUser(): void {

    this.router.navigate(['/home']);

  }


  /*
   * Navigate to Profile.
   */
  goToProfile(): void {

    this.adminPopover.hide();

    this.router.navigate(['/profile']);

  }


  /*
   * Navigate to Settings.
   */
  goToSettings(): void {

    this.adminPopover.hide();

    this.router.navigate(['/settings']);

  }


  /*
   * Navigate to Security.
   */
  goToSecurity(): void {

    this.adminPopover.hide();

    this.router.navigate(['/security']);

  }


  /*
   * Logout confirmation.
   */
  logout(): void {

    this.adminPopover.hide();

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