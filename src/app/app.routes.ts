import { Routes } from '@angular/router';
import { LoginComponent } from './feature/auth/login/login.component';
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
import { OtpVerificationComponent } from './shared/otp-verification/otp-verification.component';
import { CollageComponent } from './feature/image-studio/collage/collage.component';
import { CompressComponent } from './feature/image-studio/compress/compress.component';
import { BackgroundRemoverComponent } from './feature/image-studio/background-remover/background-remover.component';
import { SupportQueriesComponent } from './feature/queries/support-queries/support-queries.component';
import { SupportQueryDetailsComponent } from './feature/queries/support-query-details/support-query-details.component';
import { AdminDashboardComponent } from './admin-module/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './core/guards/admin.guard';
import { AdminSupportQueriesComponent } from './admin-module/admin-support-queries/admin-support-queries.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminSupportQueryDetailsComponent } from './admin-module/admin-support-query-details/admin-support-query-details.component';
import { DocumentReaderComponent } from './feature/image-studio/document-reader/document-reader.component';
import { ChangeImageTypeComponent } from './feature/image-studio/change-image-type/change-image-type.component';

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
            },
             {
                path: 'send-otp',
                component: OtpVerificationComponent,
                canActivate: [guestGuard]
            }

        ]
    },

    {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],

    children: [

        {
            path: '',
            component: AdminDashboardComponent
        },

        {
            path: 'support-queries',
            component: AdminSupportQueriesComponent
        },

        {
            path: 'support-queries/:queryId',
            component: AdminSupportQueryDetailsComponent
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
                path: 'collage',
                component: CollageComponent
            },
            {
                path: 'compress',
                component: CompressComponent
            },
            {
                path: 'background-remover',
                component: BackgroundRemoverComponent
            },
            {
                path: 'help',
                component: HelpCenterPageComponent
            },
            {
                path: 'support-queries',
                component: SupportQueriesComponent
            },
            {
                path: 'document-reader',
                component: DocumentReaderComponent
            },
             {
                path: 'change-type',
                component: ChangeImageTypeComponent
            },
            {
                path: 'support-queries/:queryId',
                component: SupportQueryDetailsComponent
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