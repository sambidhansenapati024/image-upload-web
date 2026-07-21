import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { HttpEventType } from '@angular/common/http';
import { UploadItem } from '../modal/upload-item';

@Component({
  selector: 'app-upload-area',
  imports: [CommonModule, ButtonModule, ProgressBarModule, CardModule],
  templateUrl: './upload-area.component.html',
  styleUrl: './upload-area.component.css'
})
export class UploadAreaComponent {
  @Output()
  uploadCompleted = new EventEmitter<void>();
  isDragging = false;
  uploadItems: UploadItem[] = [];
  showSuccessMessage = false;
  uploadedCount = 0;

  constructor(
    private imageService: ImageUploadServiceService) { }

  onFileSelected(event: any): void {

    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    this.addFiles(Array.from(files));

  }
  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.isDragging = true;

  }

  onDragLeave(event: DragEvent) {

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

  upload(): void {

    this.uploadItems.forEach(item => {

      if (!item.uploaded && !item.uploading) {

        this.uploadItem(item);

      }

    });

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

          const remainingSeconds = speed > 0 ? remainingBytes / speed : 0;

          item.remainingTime = remainingSeconds.toFixed(1) + " sec";

        }

        if (event.type === HttpEventType.Response) {

          item.progress = 100;

          item.uploading = false;

          item.uploaded = true;

          this.checkCompleted();

        }

      },

      error: () => {

        item.uploading = false;

        item.failed = true;

      }

    });

  }

private checkCompleted(): void {

  const completed = this.uploadItems.every(item => item.uploaded);

  if (!completed) {
    return;
  }

  this.uploadedCount = this.uploadItems.length;

  this.showSuccessMessage = true;

  this.uploadCompleted.emit();

  setTimeout(() => {

    this.uploadItems = [];

    this.showSuccessMessage = false;

    this.uploadedCount = 0;

  }, 2000);

}

  retry(item: UploadItem): void {

    this.uploadItem(item);

  }

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

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (

      parseFloat(

        (bytes / Math.pow(k, i)).toFixed(2)

      )

      + ' ' +

      sizes[i]

    );

  }

  cancelSelection(): void {

    this.uploadItems = [];

  }

  private addFiles(files: File[]): void {

    files.forEach(file => {

      const alreadyExists = this.uploadItems.some(
        item =>
          item.file.name === file.name &&
          item.file.size === file.size
      );

      if (alreadyExists) {
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

  remove(item: UploadItem): void {

    if (item.uploading) {

      return;

    }

    this.uploadItems =
      this.uploadItems.filter(i => i !== item);

  }

  isUploading(): boolean {

  return this.uploadItems.some(item => item.uploading);

}


}
