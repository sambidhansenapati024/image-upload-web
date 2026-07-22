import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { DashboardStats } from '../../shared/modal/dashboard-stats';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ImageResponse } from '../../shared/modal/image-response';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  stats!: DashboardStats;
  readonly MAX_STORAGE = 20 * 1024 * 1024 * 1024;
  storageUsed = '0 B';
  recentUploads: ImageResponse[] = [];
  remainingStorage = '20 GB';

  usagePercentage = 0;

  constructor(
    private imageService: ImageUploadServiceService
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadRecentUploads();
  }

  loadDashboardStats(): void {

    this.imageService.getDashboardStats().subscribe({

      next: (response) => {

        this.stats = response;
        this.storageUsed =
          this.formatStorage(response.totalStorage);

        this.remainingStorage =
          this.formatStorage(
            Math.max(this.MAX_STORAGE - response.totalStorage, 0)
          );

        this.usagePercentage =
          (response.totalStorage / this.MAX_STORAGE) * 100;

        console.log(this.stats);

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  formatStorage(bytes: number): string {

    if (bytes < 1024) {
      return bytes + ' B';
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

  }

  getRemainingStorage(): string {

    const remaining = this.MAX_STORAGE - (this.stats?.totalStorage ?? 0);

    return this.formatStorage(Math.max(remaining, 0));

  }

  getStorageUsagePercentage(): number {

    if (!this.stats) {
      return 0;
    }

    return (this.stats.totalStorage / this.MAX_STORAGE) * 100;

  }

  loadRecentUploads(): void {

  this.imageService.getImages(
    0,
    5,
    '',
    'uploadedAt',
    'desc'
  ).subscribe({

    next: (response) => {

      this.recentUploads = response.content;

      console.log(this.recentUploads);

    },

    error: (err) => {

      console.error(err);

    }

  });

}

getTimeAgo(date: string | Date): string {

  const uploaded = new Date(date).getTime();

  const now = new Date().getTime();

  const diff = Math.floor((now - uploaded) / 1000);

  if (diff < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(diff / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years > 1 ? 's' : ''} ago`;

}

}
