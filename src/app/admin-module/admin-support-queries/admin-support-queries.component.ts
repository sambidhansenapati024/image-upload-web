import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  AdminSupportQueryResponse,
  SupportQueryService
} from '../../service/support-query.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-support-queries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-support-queries.component.html',
  styleUrl: './admin-support-queries.component.css'
})
export class AdminSupportQueriesComponent
  implements OnInit {

  queries: AdminSupportQueryResponse[] = [];
  filteredQueries: AdminSupportQueryResponse[] = [];

  searchText = '';

  selectedQueryType = 'ALL';

  selectedStatus = 'ALL';

  isLoading = false;

  errorMessage = '';

  queryTypes = [
    'ALL',
    'PASSWORD',
    'IMAGE_UPLOAD',
    'RECYCLE_BIN',
    'OTHER'
  ];

  statuses = [
    'ALL',
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  ];

  constructor(
    private supportQueryService: SupportQueryService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadQueries();

  }

  getCount(status: string): number {
    return this.queries.filter(q => q.status === status).length;
  }

  loadQueries(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.supportQueryService
      .getAllAdminQueries()
      .subscribe({

        next: (response) => {

          this.queries = response;

          this.filteredQueries = response;

          this.isLoading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load admin support queries:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load support queries. Please try again.';

        }

      });

  }

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.filteredQueries =
      this.queries.filter(query => {

        const matchesSearch =
          !search ||
          query.queryId
            .toString()
            .includes(search) ||
          query.userName
            .toLowerCase()
            .includes(search) ||
          query.userEmail
            .toLowerCase()
            .includes(search) ||
          query.query
            .toLowerCase()
            .includes(search);


        const matchesType =
          this.selectedQueryType === 'ALL' ||
          query.queryType ===
            this.selectedQueryType;


        const matchesStatus =
          this.selectedStatus === 'ALL' ||
          query.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );

      });

  }

  viewQuery(queryId: number): void {

    this.router.navigate([
      '/admin/support-queries',
      queryId
    ]);

  }

}