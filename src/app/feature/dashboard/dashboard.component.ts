import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { UploadAreaComponent } from '../../shared/upload-area/upload-area.component';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { GalleryComponent } from '../gallery/gallery.component';
import { SearchBarComponent } from "../../shared/search-bar/search-bar.component";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardStats } from '../../shared/modal/dashboard-stats';
import { ImageResponse } from '../../shared/modal/image-response';
import { SortDropdownComponent } from '../../shared/sort-dropdown/sort-dropdown.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [ StatCardComponent, CommonModule, SortDropdownComponent, UploadAreaComponent, GalleryComponent, SearchBarComponent, ConfirmDialogModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {

    searchText = '';
    stats!: DashboardStats;
    images: ImageResponse[] = [];
    filteredImages: ImageResponse[] = [];
    page = 0;
    size = 2;
    sortOption = 'newest';
    totalPages = 0;
    totalElements = 0;

    sortBy = 'uploadedAt';
    direction = 'desc';

    constructor(
        private imageService: ImageUploadServiceService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService) { }

    ngOnInit() {
        this.loadImages();
        this.loadDashboardStats();
    }

loadImages() {

    this.imageService.getImages(
        this.page,
        this.size,
        this.searchText,
        this.sortBy,
        this.direction
    ).subscribe(response => {

        this.images = response.content;

        this.totalPages = response.totalPages;

        this.totalElements = response.totalElements;

    });

}

searchImages(value: string) {

    this.searchText = value;

    this.page = 0;

    this.loadImages();

}
    deleteImage(key: string) {

       const fileName = key;

        this.confirmationService.confirm({

            header: 'Delete Image',

            message: `Delete ${fileName} ?`,

            icon: 'pi pi-exclamation-triangle',

            acceptLabel: 'Delete',

            rejectLabel: 'Cancel',

            acceptButtonStyleClass: 'p-button-danger',

            accept: () => {

                this.imageService

                    .deleteImage(fileName)

                    .subscribe({

                        next: () => {

                            this.messageService.add({

                                severity: 'success',

                                summary: 'Deleted',

                                detail: 'Image deleted successfully'

                            });

                            this.refreshDashboard();

                        },

                        error: () => {

                            this.messageService.add({

                                severity: 'error',

                                summary: 'Failed',

                                detail: 'Unable to delete image'

                            });

                        }

                    });

            }

        });

    }
    viewImage(image: string) {

    }

    loadDashboardStats() {

        this.imageService
            .getDashboardStats()
            .subscribe({

                next: response => {

                    this.stats = response;

                }

            });

    }

    formatBytes(bytes: number): string {

        if (bytes === 0) {
            return '0 Bytes';
        }

        const units = ['Bytes', 'KB', 'MB', 'GB'];

        const index = Math.floor(Math.log(bytes) / Math.log(1024));

        return (
            bytes / Math.pow(1024, index)
        ).toFixed(2) + ' ' + units[index];
    }

   downloadImage(key: string) {

    this.imageService.downloadImage(key)

        .subscribe({

            next: blob => {

                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');

                a.href = url;

                a.download = key;

                a.click();

                window.URL.revokeObjectURL(url);

            }

        });

}

refreshDashboard(): void {

    this.loadImages();

    this.loadDashboardStats();

}

previousPage() {

    if (this.page > 0) {

        this.page--;

        this.loadImages();

    }

}

nextPage() {

    if (this.page < this.totalPages - 1) {

        this.page++;

        this.loadImages();

    }

}

onSortChange(value: string) {

    this.sortOption = value;

    switch (value) {

        case 'newest':
            this.sortBy = 'uploadedAt';
            this.direction = 'desc';
            break;

        case 'oldest':
            this.sortBy = 'uploadedAt';
            this.direction = 'asc';
            break;

        case 'nameAsc':
            this.sortBy = 'originalFileName';
            this.direction = 'asc';
            break;

        case 'nameDesc':
            this.sortBy = 'originalFileName';
            this.direction = 'desc';
            break;

        case 'sizeAsc':
            this.sortBy = 'fileSize';
            this.direction = 'asc';
            break;

        case 'sizeDesc':
            this.sortBy = 'fileSize';
            this.direction = 'desc';
            break;
    }

    this.page = 0;

    this.loadImages();

}

get pageNumbers(): number[] {

    return Array.from(
        { length: this.totalPages },
        (_, i) => i
    );

}

goToPage(page: number) {

    if (page === this.page) {

        return;

    }

    this.page = page;

    this.loadImages();

}

get endImage(): number {

    return Math.min(

        (this.page + 1) * this.size,

        this.totalElements

    );

}

}
