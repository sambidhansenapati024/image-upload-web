import { Routes } from '@angular/router';
import { LoginComponent } from './feature/auth/login/login.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { RegisterComponent } from './feature/auth/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { RecycleBinComponent } from './feature/recycle-bin/recycle-bin.component';
import { HomeComponent } from './feature/home/home.component';
import { UploadComponent } from './feature/upload/upload.component';
import { GalleryPageComponent } from './feature/gallery-page/gallery-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SettingsPageComponent } from './feature/settings/settings-page/settings-page.component';
import { SecurityPageComponent } from './feature/security/security-page/security-page.component';
import { HelpCardComponent } from './feature/help-center/help-card/help-card.component';
import { HelpCenterPageComponent } from './feature/help-center/help-center-page/help-center-page.component';
import { ForgotPasswordComponent } from './feature/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './feature/auth/reset-password/reset-password.component';

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
            },
            
            {
                path: 'forgot-password',
                component: ForgotPasswordComponent,
                canActivate: [guestGuard]
            },
            {
                path: 'reset-password',
                component: ResetPasswordComponent,
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
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'upload',
                component: UploadComponent
            },
            {
                path: 'gallery',
                component: GalleryPageComponent
            },
            {
                path: 'recycle-bin',
                component: RecycleBinComponent
            },
            {
                path: 'profile',
                component: ProfilePageComponent
            },
            {
                path: 'settings',
                component: SettingsPageComponent
            },
            {
                path: 'security',
                component: SecurityPageComponent
            },
            {
                path: 'help',
                component: HelpCenterPageComponent
            },
            {
                path: 'documentation',
                loadComponent: () =>
                    import('./pages/documentation/documentation-page/documentation-page.component')
                        .then(m => m.DocumentationPageComponent)
            },


        ]
    },

    {
        path: '**',
        redirectTo: 'login'
    }

];