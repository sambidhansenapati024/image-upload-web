import { Component, OnInit } from '@angular/core';
import { SupportQueryDetailsResponse, SupportQueryService } from '../../../service/support-query.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-support-query-details',
  imports: [CommonModule],
  templateUrl: './support-query-details.component.html',
  styleUrl: './support-query-details.component.css'
})
export class SupportQueryDetailsComponent
  implements OnInit {

  query: SupportQueryDetailsResponse | null = null;

  isLoading = false;

  errorMessage = '';

  queryId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private supportQueryService: SupportQueryService,
    private location: Location
  ) {}

  ngOnInit(): void {

    const queryIdParam =
      this.route.snapshot.paramMap.get('queryId');

    if (!queryIdParam) {

      this.errorMessage =
        'Invalid support query.';

      return;
    }

    this.queryId =
      Number(queryIdParam);

    if (isNaN(this.queryId)) {

      this.errorMessage =
        'Invalid support query ID.';

      return;
    }

    this.loadQuery();

  }

  loadQuery(): void {

    if (this.queryId === null) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.supportQueryService
      .getMyQueryDetails(this.queryId)
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
            'Unable to load this support query.';

        }

      });

  }

  goBack(): void {

    this.location.back();

}

formatTimelineStatus(status: string): string {

    return status
        .toLowerCase()
        .split('_')
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ');

}

}
