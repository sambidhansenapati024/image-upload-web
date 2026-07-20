import { Routes } from '@angular/router';
import { LoginComponent } from './feature/auth/login/login.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { RegisterComponent } from './feature/auth/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [

      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard]
      },

      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [guestGuard]
      }

    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];