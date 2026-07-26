import { Component } from '@angular/core';
import { SessionResponse } from '../../../../shared/modal/ession-response';
import { SessionService } from '../../../../service/session.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LogoutSessionRequest } from '../../../../shared/modal/logout-session-request';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-active-sessions-card',
  imports: [CommonModule, DatePipe,
    ButtonModule],
  templateUrl: './active-sessions-card.component.html',
  styleUrl: './active-sessions-card.component.css'
})
export class ActiveSessionsCardComponent {
    sessions: SessionResponse[] = [];

  currentSession?: SessionResponse;

  otherSessions: SessionResponse[] = [];

  loading = false;

  constructor(
    private sessionService: SessionService,
      private confirmationService: ConfirmationService,
  private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {

    this.loading = true;

    this.sessionService.getActiveSessions().subscribe({

      next: (sessions) => {

        this.sessions = sessions;

        this.currentSession = sessions.find(s => s.currentSession);

        this.otherSessions = sessions.filter(s => !s.currentSession);

        this.loading = false;

      },

      error: () => {

        this.loading = false;

      }

    });

  }

  logout(sessionId: string): void {

    console.log("Session ID:", sessionId);

  this.confirmationService.confirm({

    header: 'Sign Out Device',

    message: 'Are you sure you want to sign out this device?',

    icon: 'pi pi-exclamation-triangle',

    acceptLabel: 'Sign Out',

    rejectLabel: 'Cancel',

    acceptButtonStyleClass: 'p-button-danger',

    accept: () => {

      const request: LogoutSessionRequest = {
        sessionId: sessionId
      };

      this.sessionService.logoutSession(request).subscribe({

        next: () => {

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Device signed out successfully.'
          });

          this.loadSessions();

        },

        error: () => {

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to sign out device.'
          });

        }

      });

    }

  });

}

logoutOtherSessions(): void {

  this.confirmationService.confirm({

    header: 'Sign Out All Other Devices',

    message: 'This will sign out all other devices except the one you are currently using. Continue?',

    icon: 'pi pi-exclamation-triangle',

    acceptLabel: 'Sign Out',

    rejectLabel: 'Cancel',

    acceptButtonStyleClass: 'p-button-danger',

    accept: () => {

      this.sessionService.logoutOtherSessions().subscribe({

        next: () => {

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'All other devices have been signed out.'
          });

          this.loadSessions();

        },

        error: () => {

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to sign out other devices.'
          });

        }

      });

    }

  });

}
}
