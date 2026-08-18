import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AdminSupportQueryResponse,
  SupportQueryService
} from '../../service/support-query.service';

@Component({
  selector: 'app-admin-support-query-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './admin-support-query-details.component.html',
  styleUrl: './admin-support-query-details.component.css'
})
export class AdminSupportQueryDetailsComponent
  implements OnInit {

  query: AdminSupportQueryResponse | null = null;

  isLoading = false;

  errorMessage = '';

  isSendingResetLink = false;

resetLinkMessage = '';

resetLinkError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supportQueryService: SupportQueryService
  ) {}

  ngOnInit(): void {

    const queryId =
      Number(
        this.route.snapshot.paramMap.get('queryId')
      );

    if (!queryId) {

      this.errorMessage =
        'Invalid support query ID.';

      return;
    }

    this.loadQuery(queryId);
  }

  loadQuery(queryId: number): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.supportQueryService
      .getAdminQueryById(queryId)
      .subscribe({

        next: (response) => {

          this.query = response;

          this.isLoading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load support query:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load support query.';
        }

      });

  }

  goBack(): void {

    this.router.navigate([
      '/admin/support-queries'
    ]);

  }

  sendPasswordResetLink(): void {

  if (!this.query) {
    return;
  }

  this.isSendingResetLink = true;

  this.resetLinkMessage = '';

  this.resetLinkError = '';

  this.supportQueryService
    .sendAdminPasswordResetLink(
      this.query.queryId
    )
    .subscribe({

      next: () => {

        this.isSendingResetLink = false;

        this.resetLinkMessage =
          'Password reset link has been sent successfully.';

      },

      error: (error) => {

        console.error(
          'Failed to send password reset link:',
          error
        );

        this.isSendingResetLink = false;

        this.resetLinkError =
          error.error?.message ||
          'Unable to send password reset link.';

      }

    });

}

}