import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { SupportQueryListResponse, SupportQueryService } from '../../../service/support-query.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-queries',
  imports: [CommonModule],
  templateUrl: './support-queries.component.html',
  styleUrl: './support-queries.component.css'
})
export class SupportQueriesComponent {

    queries: SupportQueryListResponse[] = [];

  isLoading = false;

  errorMessage = '';

  constructor(
    private supportQueryService: SupportQueryService,
     private router: Router,
      private location: Location
  ) {}

  ngOnInit(): void {

    this.loadQueries();

  }

  loadQueries(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.supportQueryService
      .getMyQueries()
      .subscribe({

        next: (response) => {

          this.queries = response;

          this.isLoading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load support queries:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load your support queries. Please try again.';

        }

      });

  }

  trackQuery(queryId: number): void {

  this.router.navigate([
    '/support-queries',
    queryId
  ]);

}

goBack(): void {

  this.location.back();

}

}
