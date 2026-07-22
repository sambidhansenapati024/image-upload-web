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
            },

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
            }

        ]
    },

    {
        path: '**',
        redirectTo: 'login'
    }

];