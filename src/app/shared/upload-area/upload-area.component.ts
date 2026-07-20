import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload-area',
  imports: [CommonModule, ButtonModule, ProgressBarModule, CardModule],
  templateUrl: './upload-area.component.html',
  styleUrl: './upload-area.component.css'
})
export class UploadAreaComponent {

  @Output()
  uploadCompleted = new EventEmitter<void>();
  preview: string | null = null;

  progress = 0;
  isDragging = false;

  selectedFile?: File;

  uploading = false;

  remainingTime = '';

  uploadedSize = '';

  totalSize = '';

  uploadSpeed = '';

  startTime = 0;

  constructor(
    private imageService: ImageUploadServiceService) { }

  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.preview = reader.result as string;

    }

    reader.readAsDataURL(file);

  }
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

    this.selectedFile = files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.preview = reader.result as string;

    }

    reader.readAsDataURL(this.selectedFile);

  }

  upload() {

    if (!this.selectedFile) {
      return;
    }

    this.uploading = true;

    this.progress = 0;

    this.startTime = Date.now();

    this.imageService.upload(this.selectedFile)
      .subscribe({

        next: event => {

          if (event.type === HttpEventType.UploadProgress) {

            const loaded = event.loaded;

            const total = event.total ?? 1;

            this.progress =
              Math.round((loaded / total) * 100);

            //------------------------------------

            this.uploadedSize =
              this.formatBytes(loaded);

            this.totalSize =
              this.formatBytes(total);

            //------------------------------------

            const elapsed =
              (Date.now() - this.startTime) / 1000;

            const speed =
              loaded / elapsed;

            this.uploadSpeed =
              this.formatBytes(speed) + "/s";

            //------------------------------------

            const remainingBytes =
              total - loaded;

            const remainingSeconds =
              remainingBytes / speed;

            this.remainingTime =
              remainingSeconds.toFixed(1) + " sec";

          }

          if (event.type === HttpEventType.Response) {

            this.progress = 100;

            this.uploading = false;

            this.uploadCompleted.emit();

            // Reset UI
            this.selectedFile = undefined;
            this.preview = null;

            this.progress = 0;

            this.remainingTime = '';
            this.uploadSpeed = '';
            this.uploadedSize = '';
            this.totalSize = '';

          }


        },

        error: () => {

          this.uploading = false;

        }

      });

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

    this.selectedFile = undefined;

    this.preview = null;

    this.progress = 0;

    this.remainingTime = '';

    this.uploadSpeed = '';

    this.uploadedSize = '';

    this.totalSize = '';

  }


}
