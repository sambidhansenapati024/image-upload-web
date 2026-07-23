import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { UploadItem } from '../../shared/modal/upload-item';
import { Card } from "primeng/card";
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { ProgressBar } from "primeng/progressbar";
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-upload',
  imports: [Button, Card, FormsModule, NgForOf, NgIf, ProgressBar],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
  ];

  isDragging = false;
  uploadItems: UploadItem[] = [];
  isUploading = false;
  showSuccessMessage = false;

  uploadedCount = 0;

  currentUploadIndex = 0;

  constructor(
    private imageService: ImageUploadServiceService,
    private router: Router,
    private messageService: MessageService
  ) { }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.addFiles(Array.from(files));
  }

  onFileSelected(event: any) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    this.addFiles(Array.from(files));
  }

  private addFiles(files: File[]): void {

    files.forEach(file => {

      const alreadyExists = this.uploadItems.some(item =>
        item.file.name === file.name &&
        item.file.size === file.size
      );

      if (!this.ALLOWED_TYPES.includes(file.type)) {

        this.messageService.add({
          severity: 'error',
          summary: 'Unsupported File',
          detail: `${file.name} is not a supported image.`
        });

        return;

      }

      if (file.size > this.MAX_FILE_SIZE) {

        this.messageService.add({
          severity: 'warn',
          summary: 'File Too Large',
          detail: `${file.name} exceeds the 10 MB limit.`
        });

        return;

      }

      if (alreadyExists) {

        this.messageService.add({
          severity: 'warn',
          summary: 'Duplicate File',
          detail: `${file.name} is already in the upload queue.`
        });

        return;
      }

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

  formatBytes(bytes: number): string {

    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2))
      + ' '
      + sizes[i]
    );

  }

  remove(item: UploadItem): void {

    if (this.isUploading) {
      return;
    }

    this.uploadItems =
      this.uploadItems.filter(i => i !== item);

  }

  clearQueue(): void {

    this.uploadItems = [];

  }

  upload(): void {

    if (this.isUploading) {
      return;
    }
      if (this.uploadItems.length === 0) {

    this.messageService.add({
      severity: 'warn',
      summary: 'No Files Selected',
      detail: 'Please select at least one image to upload.'
    });

    return;
  }

    this.isUploading = true;

    this.currentUploadIndex = 0;

    this.uploadNext();

  }

  private uploadNext(): void {

    const nextItem = this.uploadItems.find(item =>
      !item.uploaded &&
      !item.uploading &&
      !item.failed
    );

    if (!nextItem) {

      this.isUploading = false;

      this.checkCompleted();

      return;

    }

    this.uploadItem(nextItem);

  }
  uploadItem(item: UploadItem): void {

    item.uploading = true;

    item.failed = false;

    item.progress = 0;

    item.startTime = Date.now();

    this.imageService.upload([item.file]).subscribe({

      next: event => {

        if (event.type === HttpEventType.UploadProgress) {
          const loaded = event.loaded;

          const total = event.total ?? 1;

          item.progress = Math.round((loaded / total) * 100);

          item.uploadedSize = this.formatBytes(loaded);

          item.totalSize = this.formatBytes(total);

          const elapsed = (Date.now() - item.startTime) / 1000;

          const speed = elapsed > 0 ? loaded / elapsed : 0;

          item.uploadSpeed = this.formatBytes(speed) + "/s";

          const remainingBytes = total - loaded;

          const remainingSeconds =
            speed > 0 ? remainingBytes / speed : 0;

          item.remainingTime =
            remainingSeconds.toFixed(1) + " sec";

        }

        if (event.type === HttpEventType.Response) {

          item.progress = 100;

          item.uploading = false;

          item.uploaded = true;

          this.uploadNext();
          //this.checkCompleted();

        }

      },

      error: () => {

        item.uploading = false;

        item.failed = true;

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `${item.file.name} could not be uploaded.`
        });

      }

    });

  }

  private checkCompleted(): void {

    const completed = this.uploadItems.every(item => item.uploaded);

    if (!completed) {
      return;
    }

    this.isUploading = false;

    this.uploadedCount = this.uploadItems.length;

    this.showSuccessMessage = true;
    this.messageService.add({
      severity: 'success',
      summary: 'Upload Complete',
      detail: `${this.uploadedCount} image${this.uploadedCount > 1 ? 's' : ''} uploaded successfully.`
    })

  }

  goToGallery(): void {
    this.router.navigate(['/gallery']);
  }

  resetUpload(): void {
    this.uploadItems = [];
    this.showSuccessMessage = false;
    this.uploadedCount = 0;
  }

  uploadMore(): void {

    this.uploadItems = [];

    this.showSuccessMessage = false;

    this.uploadedCount = 0;

  }
}
