import { Component } from '@angular/core';
import { ChangePasswordCardComponent } from '../components/change-password-card/change-password-card.component';
import { ActiveSessionsCardComponent } from '../components/active-sessions-card/active-sessions-card.component';
import { TwoFactorCardComponent } from '../components/two-factor-card/two-factor-card.component';

@Component({
  selector: 'app-security-page',
  imports: [ChangePasswordCardComponent,
    TwoFactorCardComponent,
  ActiveSessionsCardComponent
  ],
  templateUrl: './security-page.component.html',
  styleUrl: './security-page.component.css'
})
export class SecurityPageComponent {

}
