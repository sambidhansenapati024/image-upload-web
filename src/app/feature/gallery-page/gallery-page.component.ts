import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ImageCardComponent } from '../../shared/image-card/image-card.component';
import { GalleriaModule } from 'primeng/galleria';
import { ImageResponse } from '../../shared/modal/image-response';
import { Button } from "primeng/button";
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Select } from "primeng/select";
import { Paginator } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { GalleryToolbarComponent } from "../../shared/gallery-toolbar/gallery-toolbar.component";


@Component({
  selector: 'app-gallery-page',
  providers: [
        ConfirmationService,
        MessageService
    ],
  imports: [CommonModule, ImageCardComponent, GalleriaModule, Button, InputTextModule, FormsModule, Select, Paginator, SkeletonModule, IconField, InputIcon, ConfirmDialogModule, ToastModule, GalleryToolbarComponent],
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.css'
})
export class GalleryPageComponent implements OnInit, OnChanges {

  display = false;
  activeIndex = 0;
  galleryImages: any[] = [];
  searchText = '';
  images: ImageResponse[] = [];
  page = 0;
  totalRecords = 0;
  size = 2;
  loading = false;
  sortBy = 'uploadedAt';
  private searchSubject = new Subject<string>();

  direction = 'desc';
  sortOptions = [

    {
      label: 'Newest First',
      sortBy: 'uploadedAt',
      direction: 'desc'
    },

    {
      label: 'Oldest First',
      sortBy: 'uploadedAt',
      direction: 'asc'
    },

    {
      label: 'Name (A-Z)',
      sortBy: 'originalFileName',
      direction: 'asc'
    },

    {
      label: 'Name (Z-A)',
      sortBy: 'originalFileName',
      direction: 'desc'
    }

  ];

  selectedSort = this.sortOptions[0];

  constructor(
    private imageService: ImageUploadServiceService,
    private confirmationService: ConfirmationService,
  private messageService: MessageService
  ) { }

  ngOnInit(): void {

    this.loadImages();
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(search => {

        this.searchText = search;

        this.page = 0;

        this.loadImages();

      });

  }

  ngOnChanges() {

    this.galleryImages = this.images.map(image => ({

      itemImageSrc: image.imageUrl,

      thumbnailImageSrc: image.imageUrl,

      originalFileName: image.originalFileName,

      fileSize: image.fileSize,

      uploadedAt: image.uploadedAt

    }));
  }

  openImage(image: ImageResponse) {

    this.activeIndex = this.images.findIndex(img => img.id === image.id);

    this.display = true;

  }

  formatFileSize(bytes: number): string {

    if (!bytes) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(size < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
  }

  getTimeAgo(date: string): string {

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  // deleteCurrentImage() {

  //   this.delete.emit(this.images[this.activeIndex].key);

  //   this.display = false;

  // }

loadImages() {

    this.loading = true;

    this.imageService.getImages(
        this.page,
        this.size,
        this.searchText,
        this.sortBy,
        this.direction
    ).subscribe({

        next: response => {

            this.images = response.content;

            this.totalRecords = response.totalElements;

            this.loading = false;

        },

        error: () => {

            this.loading = false;

        }

    });

}

  onSearch() {

    this.searchSubject.next(this.searchText);

  }

  onSortChange() {

  this.sortBy = this.selectedSort.sortBy;

  this.direction = this.selectedSort.direction;

  this.page = 0;

  this.loadImages();

}

onPageChange(event: any) {

    this.page = event.page;

    this.size = event.rows;

    this.loadImages();

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

      },

      error: err => {

        console.error(err);

      }

    });

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

                            this.loadImages();

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

}
