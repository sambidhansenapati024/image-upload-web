import { Component, OnInit } from '@angular/core';
import { ImageResponse } from '../../shared/modal/image-response';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { ImageCardComponent } from "../../shared/image-card/image-card.component";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GalleryToolbarComponent } from "../../shared/gallery-toolbar/gallery-toolbar.component";
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-recycle-bin',
  imports: [ImageCardComponent, ConfirmDialogModule, FormsModule, GalleryToolbarComponent, Paginator],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css'
})
export class RecycleBinComponent implements OnInit {

images: ImageResponse[] = [];
private searchSubject = new Subject<string>();
page = 0;
size = 2;
searchText = '';

sortBy = 'deletedAt';
direction = 'desc';

totalRecords = 0;
loading = false;

sortOptions = [
  {
    label: 'Newest First',
    sortBy: 'deletedAt',
    direction: 'desc'
  },
  {
    label: 'Oldest First',
    sortBy: 'deletedAt',
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

ngOnInit() {

    this.loadDeletedImages();

    this.searchSubject
        .pipe(
            debounceTime(300),
            distinctUntilChanged()
        )
        .subscribe(search => {

            this.searchText = search;

            this.page = 0;

            this.loadDeletedImages();

        });

}

onSearch() {

    this.searchSubject.next(this.searchText);

}
onSortChange() {

    this.sortBy = this.selectedSort.sortBy;

    this.direction = this.selectedSort.direction;

    this.page = 0;

    this.loadDeletedImages();

}

loadDeletedImages() {

    this.loading = true;

    this.imageService.getDeletedImages(
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

restoreImage(id: number) {

    this.confirmationService.confirm({

        header: 'Restore Image',

        message: 'Do you want to restore this image?',

        icon: 'pi pi-refresh',

        acceptLabel: 'Restore',

        rejectLabel: 'Cancel',

       accept: () => {

    this.imageService.restoreImage(id)
        .subscribe({

            next: () => {

                this.messageService.add({

                    severity: 'success',

                    summary: 'Restored',

                    detail: 'Image restored successfully'

                });

                this.loadDeletedImages();

            },

            error: () => {

                this.messageService.add({

                    severity: 'error',

                    summary: 'Failed',

                    detail: 'Unable to restore image'

                });

            }

        });

}

    });

}

deleteForever(id: number) {

    this.confirmationService.confirm({

        header: 'Delete Permanently',

        message: 'This image will be permanently deleted and cannot be recovered. Continue?',

        icon: 'pi pi-exclamation-triangle',

        acceptLabel: 'Delete',

        rejectLabel: 'Cancel',

        acceptButtonStyleClass: 'p-button-danger',

        accept: () => {

            this.imageService.permanentlyDelete(id)
                .subscribe({

                    next: () => {

                        this.messageService.add({

                            severity: 'success',

                            summary: 'Deleted',

                            detail: 'Image permanently deleted'

                        });

                        this.loadDeletedImages();

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

onPageChange(event: any) {

    this.page = event.page;

    this.size = event.rows;

    this.loadDeletedImages();

}

}
