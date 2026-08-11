import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadServiceService } from '../../../service/image-upload-service.service';

@Component({
  selector: 'app-compress',
  imports: [CommonModule,FormsModule],
  templateUrl: './compress.component.html',
  styleUrl: './compress.component.css'
})
export class CompressComponent {

   selectedFile: File | null = null;

  imagePreview: string | null = null;

  compressedFile: File | null = null;

compressedPreview: string | null = null;

compressedSize = 0;
compressionPercentage = 0;
originalWidth = 0;
originalHeight = 0;
compressedWidth = 0;
compressedHeight = 0;
targetReached = true;
uploading = false;
compressing = false;
uploadSuccess = false;

  originalSize = 0;

compressionMode: 'high' | 'medium' | 'low' | 'custom' = 'high';

customSize = 1;

customSizeUnit: 'KB' | 'MB' = 'MB';
resizeEnabled = false;

maxWidth = 1920;

maintainAspectRatio = true;

  validationMessage = '';



  constructor(
  private imageUploadService: ImageUploadServiceService
) {}

uploadCompressedImage(): void {

  if (!this.compressedFile) {

    this.validationMessage =
      'Please compress the image first.';

    return;
  }

  if (this.uploading) {
    return;
  }

  this.uploading = true;
  this.uploadSuccess = false;

  this.validationMessage = '';

  this.imageUploadService
    .uploadCompress(this.compressedFile)
    .subscribe({

      next: (response) => {

        this.uploading = false;

        console.log(
          'Compressed image uploaded successfully:',
          response
        );

        this.uploadSuccess = true;

      },

      error: (error) => {

        this.uploading = false;

        console.error(
          'Upload failed:',
          error
        );

        this.validationMessage =
          error.error?.message ??
          'Unable to upload compressed image.';
      }

    });
}

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.validationMessage = '';

    // Only images
    if (!file.type.startsWith('image/')) {

      this.validationMessage =
        'Please select a valid image file.';

      return;
    }

    this.selectedFile = file;
    this.originalSize = file.size;
    this.compressedFile = null;
this.compressedPreview = null;
this.compressedSize = 0;
this.compressionPercentage = 0;
this.targetReached = true;
this.originalWidth = 0;
this.originalHeight = 0;
this.compressedWidth = 0;
this.compressedHeight = 0;
this.uploadSuccess = false;

    const reader = new FileReader();

   reader.onload = () => {

  this.imagePreview =
    reader.result as string;

  const image = new Image();

  image.onload = () => {

    this.originalWidth =
      image.naturalWidth;

    this.originalHeight =
      image.naturalHeight;

  };

  image.src =
    this.imagePreview;
};

    reader.readAsDataURL(file);
  }

  formatFileSize(bytes: number): string {

  if (bytes === 0) {
    return '0 Bytes';
  }

  const units = [
    'Bytes',
    'KB',
    'MB',
    'GB'
  ];

  const index =
    Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

  return (
    parseFloat(
      (bytes / Math.pow(1024, index))
        .toFixed(2)
    )
    + ' '
    + units[index]
  );
}

async compressImage(): Promise<void> {

  if (!this.selectedFile) {

    this.validationMessage =
      'Please select an image first.';

    return;
  }

  if (
  this.compressionMode === 'custom' &&
  (!this.customSize || this.customSize <= 0)
) {

  this.validationMessage =
    'Please enter a valid target size.';

  return;
}

const targetBytes =
  this.getCustomTargetSizeBytes();

if (
  this.compressionMode === 'custom' &&
  targetBytes &&
  targetBytes >= this.originalSize
) {

  this.validationMessage =
    `Target size must be smaller than the original image size (${this.formatFileSize(this.originalSize)}).`;

  return;
}


  if (this.compressing) {
    return;
  }

  this.compressing = true;

  this.validationMessage = '';

  try {

    const image =
      await this.loadImage(
        this.imagePreview!
      );

    const canvas =
      document.createElement('canvas');

 const dimensions =
  this.getResizedDimensions(
    image.naturalWidth,
    image.naturalHeight
  );

  this.compressedWidth =
  dimensions.width;

this.compressedHeight =
  dimensions.height;

canvas.width =
  dimensions.width;

canvas.height =
  dimensions.height;

    const context =
      canvas.getContext('2d');

    if (!context) {

      throw new Error(
        'Unable to create canvas context.'
      );
    }

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

   const targetBytes =
  this.getCustomTargetSizeBytes();

let blob: Blob | null;

if (this.compressionMode === 'custom') {

  if (!targetBytes) {

    this.validationMessage =
      'Please enter a valid target size.';

    return;
  }
  
  

  blob =
    await this.compressToTargetSize(
      canvas,
      targetBytes
    );
    

} else {

  const quality =
    this.getCompressionQuality();

  blob =
    await new Promise<Blob | null>(
      resolve => {

        canvas.toBlob(
          resolve,
          'image/jpeg',
          quality
        );

      }
    );
}

    if (!blob) {

      throw new Error(
        'Unable to compress image.'
      );
    }

const compressedFile = new File(
  [blob],
  this.getCompressedFileName(),
  {
    type: 'image/jpeg'
  }
);

this.compressedFile = compressedFile;

this.compressedSize =
  compressedFile.size;

  if (targetBytes) {

  this.targetReached =
    compressedFile.size <= targetBytes;

  if (!this.targetReached) {

    this.validationMessage =
      `Target size could not be reached. ` +
      `Requested: ${this.customSize} ${this.customSizeUnit}. ` +
      `Actual: ${this.formatFileSize(
        compressedFile.size
      )}.`;

  }
}

if (
  targetBytes &&
  compressedFile.size > targetBytes
) {

  this.validationMessage =
    `Unable to compress the image below ${
      this.customSize
    } ${this.customSizeUnit}. The smallest result is ${
      this.formatFileSize(
        compressedFile.size
      )
    }.`;
}

      this.compressionPercentage =
  this.originalSize > 0
    ? Math.max(
        0,
        Math.round(
          (
            (this.originalSize - this.compressedSize)
            / this.originalSize
          ) * 100
        )
      )
    : 0;

    this.compressedPreview =
      URL.createObjectURL(blob);

  } catch (error) {

    console.error(
      'Image compression failed:',
      error
    );

    this.validationMessage =
      'Unable to compress image. Please try again.';

  } finally {

    this.compressing = false;
  }
}

private getCompressionQuality(): number {

  switch (this.compressionMode) {

    case 'high':
      return 0.85;

    case 'medium':
      return 0.65;

    case 'low':
      return 0.45;

    default:
      return 0.85;
  }
}

private getCompressedFileName(): string {

  if (!this.selectedFile) {
    return 'compressed-image.jpg';
  }

  const originalName =
    this.selectedFile.name;

  const dotIndex =
    originalName.lastIndexOf('.');

  const name =
    dotIndex > 0
      ? originalName.substring(0, dotIndex)
      : originalName;

  return `${name}-compressed.jpg`;
}

private loadImage(
  source: string
): Promise<HTMLImageElement> {

  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            'Unable to load image.'
          )
        );

      image.src = source;
    }
  );
}

downloadCompressedImage(): void {

  if (!this.compressedFile) {
    return;
  }

  const url =
    URL.createObjectURL(
      this.compressedFile
    );

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    this.compressedFile.name;

  link.click();

  URL.revokeObjectURL(url);
}

private getCustomTargetSizeBytes(): number | null {

  if (
    this.compressionMode !== 'custom'
  ) {
    return null;
  }

  if (
    !this.customSize ||
    this.customSize <= 0
  ) {
    return null;
  }

  if (this.customSizeUnit === 'KB') {

    return this.customSize * 1024;
  }

  return this.customSize * 1024 * 1024;
}

private async compressToTargetSize(
  canvas: HTMLCanvasElement,
  targetBytes: number
): Promise<Blob | null> {

  let currentWidth = canvas.width;
  let currentHeight = canvas.height;

  let smallestBlob: Blob | null = null;

  // Try up to 5 different image sizes
  for (let dimensionAttempt = 0; dimensionAttempt < 5; dimensionAttempt++) {

     if (currentWidth < 320 || currentHeight < 320) {
    break;
  }

    canvas.width = currentWidth;
    canvas.height = currentHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    context.clearRect(
      0,
      0,
      currentWidth,
      currentHeight
    );

    // Draw the image at the current dimensions
    const image = await this.loadImage(
      this.imagePreview!
    );

    context.drawImage(
      image,
      0,
      0,
      currentWidth,
      currentHeight
    );

    let minQuality = 0.1;
    let maxQuality = 0.95;

    let bestBlob: Blob | null = null;

    // Find the highest quality that fits the target
    for (let qualityAttempt = 0; qualityAttempt < 8; qualityAttempt++) {

      const quality =
        (minQuality + maxQuality) / 2;

      const blob =
        await new Promise<Blob | null>(
          resolve => {

            canvas.toBlob(
              resolve,
              'image/jpeg',
              quality
            );

          }
        );

      if (!blob) {
        return null;
      }

      // Keep the smallest result we've found
      if (
        !smallestBlob ||
        blob.size < smallestBlob.size
      ) {
        smallestBlob = blob;
      }

      if (blob.size <= targetBytes) {

        bestBlob = blob;

        // Try better quality
        minQuality = quality;

      } else {

        // File is still too large
        maxQuality = quality;
      }
    }

    // Target reached
    if (bestBlob) {
      return bestBlob;
    }

    /*
     * Target not reached.
     *
     * Reduce dimensions by 20%
     * and try again.
     */
    currentWidth =
      Math.floor(currentWidth * 0.8);

    currentHeight =
      Math.floor(currentHeight * 0.8);

  }

  // Target could not be reached.
  // Return the smallest result we found.
  return smallestBlob;
}

private getResizedDimensions(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {

  if (
    !this.resizeEnabled ||
    !this.maxWidth ||
    this.maxWidth >= originalWidth
  ) {
    return {
      width: originalWidth,
      height: originalHeight
    };
  }

  const ratio =
    originalHeight / originalWidth;

  const width =
    this.maxWidth;

  const height =
    Math.round(width * ratio);

  return {
    width,
    height
  };
}

resetCompression(): void {

  if (this.compressedPreview) {
    URL.revokeObjectURL(this.compressedPreview);
  }

  this.selectedFile = null;

  this.imagePreview = null;

  this.compressedFile = null;

  this.compressedPreview = null;

  this.originalSize = 0;

  this.compressedSize = 0;

  this.compressionPercentage = 0;

  this.originalWidth = 0;

  this.originalHeight = 0;

  this.compressedWidth = 0;

  this.compressedHeight = 0;

  this.targetReached = true;

  this.validationMessage = '';

  this.compressionMode = 'high';

  this.customSize = 1;

  this.customSizeUnit = 'MB';

  this.resizeEnabled = false;

  this.maxWidth = 1920;

}

}
