import { Component } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

import { UploadItem } from '../../shared/modal/upload-item';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';


@Component({
  selector: 'app-upload',
  imports: [
    Button,
    Card,
    FormsModule,
    ProgressBar
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  // ============================================================
  // File restrictions
  // ============================================================

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
  ];


  // ============================================================
  // Component state
  // ============================================================

  isDragging = false;

  uploadItems: UploadItem[] = [];

  isUploading = false;

  showSuccessMessage = false;

  uploadedCount = 0;

  currentUploadIndex = 0;


  // ============================================================
  // Constructor
  // ============================================================

  constructor(
    private imageService: ImageUploadServiceService,
    private router: Router,
    private messageService: MessageService
  ) {}


  // ============================================================
  // Drag & Drop
  // ============================================================

  onDragOver(event: DragEvent): void {

    event.preventDefault();

    this.isDragging = true;
  }


  onDragLeave(event: DragEvent): void {

    event.preventDefault();

    this.isDragging = false;
  }


  onDrop(event: DragEvent): void {

    event.preventDefault();

    this.isDragging = false;

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.addFiles(Array.from(files));
  }


  // ============================================================
  // File selection
  // ============================================================

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    this.addFiles(Array.from(files));

    // Allow selecting the same file again later
    input.value = '';
  }


  // ============================================================
  // Add files to queue
  // ============================================================

  private addFiles(files: File[]): void {

    files.forEach(file => {

      // --------------------------------------------------------
      // Duplicate check
      // --------------------------------------------------------

      const alreadyExists = this.uploadItems.some(item =>
        item.file.name === file.name &&
        item.file.size === file.size
      );


      // --------------------------------------------------------
      // File type validation
      // --------------------------------------------------------

      if (!this.ALLOWED_TYPES.includes(file.type)) {

        this.messageService.add({
          severity: 'error',
          summary: 'Unsupported File',
          detail: `${file.name} is not a supported image.`
        });

        return;
      }


      // --------------------------------------------------------
      // File size validation
      // --------------------------------------------------------

      if (file.size > this.MAX_FILE_SIZE) {

        this.messageService.add({
          severity: 'warn',
          summary: 'File Too Large',
          detail: `${file.name} exceeds the 10 MB limit.`
        });

        return;
      }


      // --------------------------------------------------------
      // Duplicate validation
      // --------------------------------------------------------

      if (alreadyExists) {

        this.messageService.add({
          severity: 'warn',
          summary: 'Duplicate File',
          detail: `${file.name} is already in the upload queue.`
        });

        return;
      }


      // --------------------------------------------------------
      // Generate preview
      // --------------------------------------------------------

      const reader = new FileReader();

      reader.onload = () => {

        this.uploadItems.push({

          file,

          preview: reader.result as string,

          progress: 0,

          uploading: false,

          uploaded: false,

          failed: false,

          uploadedSize: '',

          totalSize: this.formatBytes(file.size),

          uploadSpeed: '',

          remainingTime: '',

          startTime: 0

        });

      };

      reader.readAsDataURL(file);

    });
  }


  // ============================================================
  // Format bytes
  // ============================================================

  formatBytes(bytes: number): string {

    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;

    const sizes = [
      'Bytes',
      'KB',
      'MB',
      'GB'
    ];

    const i = Math.floor(
      Math.log(bytes) / Math.log(k)
    );

    return (
      parseFloat(
        (bytes / Math.pow(k, i)).toFixed(2)
      )
      + ' '
      + sizes[i]
    );
  }


  // ============================================================
  // Remove single file
  // ============================================================

  remove(item: UploadItem): void {

    if (this.isUploading) {
      return;
    }

    this.uploadItems =
      this.uploadItems.filter(
        currentItem => currentItem !== item
      );
  }


  // ============================================================
  // Clear queue
  // ============================================================

  clearQueue(): void {

    if (this.isUploading) {
      return;
    }

    this.uploadItems = [];
  }


  // ============================================================
  // Start upload
  // ============================================================

  upload(): void {

    if (this.isUploading) {
      return;
    }


    // ----------------------------------------------------------
    // No files
    // ----------------------------------------------------------

    if (this.uploadItems.length === 0) {

      this.messageService.add({
        severity: 'warn',
        summary: 'No Files Selected',
        detail: 'Please select at least one image to upload.'
      });

      return;
    }


    // ----------------------------------------------------------
    // Start uploading
    // ----------------------------------------------------------

    this.isUploading = true;

    this.showSuccessMessage = false;

    this.uploadedCount = 0;

    this.currentUploadIndex = 0;

    this.uploadNext();
  }


  // ============================================================
  // Find next file
  // ============================================================

  private uploadNext(): void {

    const nextItem = this.uploadItems.find(item =>
      !item.uploaded &&
      !item.uploading &&
      !item.failed
    );


    // ----------------------------------------------------------
    // No more files
    // ----------------------------------------------------------

    if (!nextItem) {

      this.isUploading = false;

      this.checkCompleted();

      return;
    }


    // ----------------------------------------------------------
    // Upload next file
    // ----------------------------------------------------------

    this.uploadItem(nextItem);
  }


  // ============================================================
  // Upload individual file
  // ============================================================

  uploadItem(item: UploadItem): void {

    item.uploading = true;

    item.failed = false;

    item.progress = 0;

    item.uploadedSize = '0 Bytes';

    item.totalSize =
      this.formatBytes(item.file.size);

    item.uploadSpeed = '';

    item.remainingTime = '';

    item.startTime = Date.now();


    this.imageService
      .upload([item.file])
      .subscribe({

        // ======================================================
        // Upload events
        // ======================================================

        next: event => {


          // ----------------------------------------------------
          // Upload progress
          // ----------------------------------------------------

          if (
            event.type ===
            HttpEventType.UploadProgress
          ) {

            const loaded = event.loaded;

            const total =
              event.total ??
              item.file.size;


            // Percentage
            item.progress =
              Math.round(
                (loaded / total) * 100
              );


            // Uploaded size
            item.uploadedSize =
              this.formatBytes(loaded);


            // Total size
            item.totalSize =
              this.formatBytes(total);


            // --------------------------------------------------
            // Upload speed
            // --------------------------------------------------

            const elapsed =
              (Date.now() - item.startTime) / 1000;


            const speed =
              elapsed > 0
                ? loaded / elapsed
                : 0;


            item.uploadSpeed =
              speed > 0
                ? this.formatBytes(speed) + '/s'
                : 'Calculating...';


            // --------------------------------------------------
            // Remaining time
            // --------------------------------------------------

            const remainingBytes =
              Math.max(total - loaded, 0);


            const remainingSeconds =
              speed > 0
                ? remainingBytes / speed
                : 0;


            if (remainingSeconds > 0) {

              item.remainingTime =
                remainingSeconds < 60

                  ? `${remainingSeconds.toFixed(1)} sec`

                  : `${Math.ceil(
                      remainingSeconds / 60
                    )} min`;
            }

            else {

              item.remainingTime =
                'Almost done';
            }
          }


          // ----------------------------------------------------
          // Upload completed
          // ----------------------------------------------------

          if (
            event.type ===
            HttpEventType.Response
          ) {

            item.progress = 100;

            item.uploading = false;

            item.uploaded = true;

            item.failed = false;

            item.uploadedSize =
              this.formatBytes(
                item.file.size
              );

            item.totalSize =
              this.formatBytes(
                item.file.size
              );

            item.remainingTime =
              'Complete';

            item.uploadSpeed = '';


            // --------------------------------------------------
            // Continue with next file
            // --------------------------------------------------

            this.uploadNext();
          }
        },


        // ======================================================
        // Upload failed
        // ======================================================

        error: error => {

          console.error(
            'Image upload failed:',
            error
          );


          item.uploading = false;

          item.failed = true;

          item.uploaded = false;


          // Stop automatic queue processing.
          // User can now click Retry.
          this.isUploading = false;


          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail:
              `${item.file.name} could not be uploaded.`
          });
        }

      });
  }


  // ============================================================
  // Retry failed upload
  // ============================================================

  retry(item: UploadItem): void {

    // Prevent multiple simultaneous uploads
    if (this.isUploading) {
      return;
    }


    // ----------------------------------------------------------
    // Reset item state
    // ----------------------------------------------------------

    item.failed = false;

    item.uploaded = false;

    item.uploading = false;

    item.progress = 0;

    item.uploadedSize = '0 Bytes';

    item.totalSize =
      this.formatBytes(item.file.size);

    item.uploadSpeed = '';

    item.remainingTime = '';

    item.startTime = 0;


    // ----------------------------------------------------------
    // Start retry
    // ----------------------------------------------------------

    this.isUploading = true;

    this.uploadItem(item);
  }


  // ============================================================
  // Check whether everything completed
  // ============================================================

  private checkCompleted(): void {

    const completed =
      this.uploadItems.length > 0 &&
      this.uploadItems.every(
        item => item.uploaded
      );


    if (!completed) {
      return;
    }


    this.isUploading = false;

    this.uploadedCount =
      this.uploadItems.length;

    this.showSuccessMessage = true;


    // ----------------------------------------------------------
    // Success notification
    // ----------------------------------------------------------

    this.messageService.add({

      severity: 'success',

      summary: 'Upload Complete',

      detail:
        `${this.uploadedCount} image${
          this.uploadedCount > 1
            ? 's'
            : ''
        } uploaded successfully.`

    });
  }


  // ============================================================
  // Navigate to gallery
  // ============================================================

  goToGallery(): void {

    this.router.navigate([
      '/gallery'
    ]);
  }


  // ============================================================
  // Reset upload
  // ============================================================

  resetUpload(): void {

    if (this.isUploading) {
      return;
    }

    this.uploadItems = [];

    this.showSuccessMessage = false;

    this.uploadedCount = 0;

    this.currentUploadIndex = 0;
  }


  // ============================================================
  // Upload more
  // ============================================================

  uploadMore(): void {

    if (this.isUploading) {
      return;
    }

    this.uploadItems = [];

    this.showSuccessMessage = false;

    this.uploadedCount = 0;

    this.currentUploadIndex = 0;
  }
}