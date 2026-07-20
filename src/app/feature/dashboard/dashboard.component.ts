import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { UploadAreaComponent } from '../../shared/upload-area/upload-area.component';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { GalleryComponent } from '../gallery/gallery.component';
import { SearchBarComponent } from "../../shared/search-bar/search-bar.component";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardStats } from '../../shared/modal/dashboard-stats';
import { ImageResponse } from '../../shared/modal/image-response';

@Component({
    selector: 'app-dashboard',
    providers: [
        ConfirmationService,
        MessageService
    ],
    imports: [ StatCardComponent, UploadAreaComponent, GalleryComponent, SearchBarComponent, ToastModule, ConfirmDialogModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {

    searchText = '';
    stats!: DashboardStats;
    images: ImageResponse[] = [];
    filteredImages: ImageResponse[] = [];

    constructor(
        private imageService: ImageUploadServiceService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService) { }

    ngOnInit() {
        this.loadImages();
        this.loadDashboardStats();
    }

    loadImages() {

        this.imageService.getAllImage()

            .subscribe(images => {

                this.images = images;

                this.filteredImages = images;

            });

    }

searchImages(value: string) {

    this.searchText = value;

    this.filteredImages = this.images.filter(image =>

        image.originalFileName
            .toLowerCase()
            .includes(value.toLowerCase())

    );

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

}
