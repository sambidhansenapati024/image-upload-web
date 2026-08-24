import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ImageFormat {
  value: 'image/jpeg' | 'image/png' | 'image/webp';
  label: string;
  extension: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-change-image-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-image-type.component.html',
  styleUrl: './change-image-type.component.css'
})
export class ChangeImageTypeComponent {

  selectedFile: File | null = null;

  originalPreview: string | null = null;
  convertedPreview: string | null = null;

  selectedFormat: ImageFormat['value'] = 'image/png';

  convertedBlob: Blob | null = null;

  isGenerating = false;
  dragOver = false;

  errorMessage = '';

  readonly formats: ImageFormat[] = [
    {
      value: 'image/jpeg',
      label: 'JPG',
      extension: 'jpg',
      description: 'Small size & widely supported',
      icon: 'pi pi-image'
    },
    {
      value: 'image/png',
      label: 'PNG',
      extension: 'png',
      description: 'Lossless & transparent',
      icon: 'pi pi-images'
    },
    {
      value: 'image/webp',
      label: 'WEBP',
      extension: 'webp',
      description: 'Modern & lightweight',
      icon: 'pi pi-bolt'
    }
  ];

  get selectedFormatInfo(): ImageFormat {
    return (
      this.formats.find(
        format => format.value === this.selectedFormat
      ) ?? this.formats[1]
    );
  }

  get hasFile(): boolean {
    return !!this.selectedFile;
  }

  get hasConvertedImage(): boolean {
    return !!this.convertedBlob && !!this.convertedPreview;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.handleFile(input.files[0]);

    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver = false;

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.handleFile(files[0]);
  }

  private handleFile(file: File): void {

    this.errorMessage = '';
    this.convertedBlob = null;

    if (this.convertedPreview) {
      URL.revokeObjectURL(this.convertedPreview);
      this.convertedPreview = null;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage =
        'Please upload a valid image file.';

      return;
    }

    /*
     * Browser canvas conversion works reliably
     * with these common image formats.
     */
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (!supportedTypes.includes(file.type.toLowerCase())) {
      this.errorMessage =
        'This image format is not supported by the browser converter. Please use JPG, PNG, WEBP or GIF.';

      return;
    }

    this.selectedFile = file;

    if (this.originalPreview) {
      URL.revokeObjectURL(this.originalPreview);
    }

    this.originalPreview =
      URL.createObjectURL(file);
  }

  selectFormat(
    format: ImageFormat['value']
  ): void {

    this.selectedFormat = format;

    /*
     * If a converted image already exists,
     * remove it because the output format changed.
     */
    this.clearConvertedImage();
  }

  async generate(): Promise<void> {

    if (!this.selectedFile) {
      this.errorMessage =
        'Please upload an image first.';
      return;
    }

    if (this.isGenerating) {
      return;
    }

    this.errorMessage = '';
    this.isGenerating = true;

    this.clearConvertedImage();

    try {

      const image =
        await this.loadImage(
          this.selectedFile
        );

      const canvas =
        document.createElement('canvas');

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context =
        canvas.getContext('2d');

      if (!context) {
        throw new Error(
          'Unable to create canvas.'
        );
      }

      /*
       * JPEG does not support transparency.
       * Use a white background when converting
       * a transparent image to JPG.
       */
      if (
        this.selectedFormat === 'image/jpeg'
      ) {

        context.fillStyle = '#ffffff';

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      context.drawImage(
        image,
        0,
        0
      );

      const blob =
        await this.canvasToBlob(
          canvas,
          this.selectedFormat
        );

      if (!blob) {
        throw new Error(
          'The browser could not generate the selected image format.'
        );
      }

      this.convertedBlob = blob;

      this.convertedPreview =
        URL.createObjectURL(blob);

    } catch (error) {

      console.error(
        'Image conversion failed:',
        error
      );

      this.errorMessage =
        'Unable to convert the image. Please try another image or format.';

    } finally {

      this.isGenerating = false;
    }
  }

  download(): void {

    if (
      !this.convertedBlob ||
      !this.selectedFile
    ) {
      return;
    }

    const url =
      URL.createObjectURL(
        this.convertedBlob
      );

    const anchor =
      document.createElement('a');

    anchor.href = url;

    anchor.download =
      this.getOutputFileName();

    anchor.style.display = 'none';

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  reset(): void {

    if (this.originalPreview) {
      URL.revokeObjectURL(
        this.originalPreview
      );
    }

    if (this.convertedPreview) {
      URL.revokeObjectURL(
        this.convertedPreview
      );
    }

    this.selectedFile = null;

    this.originalPreview = null;

    this.convertedPreview = null;

    this.convertedBlob = null;

    this.errorMessage = '';

    this.selectedFormat =
      'image/png';

    this.isGenerating = false;
  }

  private clearConvertedImage(): void {

    if (this.convertedPreview) {
      URL.revokeObjectURL(
        this.convertedPreview
      );
    }

    this.convertedPreview = null;

    this.convertedBlob = null;
  }

  private getOutputFileName(): string {

    if (!this.selectedFile) {
      return `converted-image.${this.selectedFormatInfo.extension}`;
    }

    const originalName =
      this.selectedFile.name;

    const lastDot =
      originalName.lastIndexOf('.');

    const name =
      lastDot > 0
        ? originalName.substring(
            0,
            lastDot
          )
        : originalName;

    return `${name}-converted.${this.selectedFormatInfo.extension}`;
  }

  private loadImage(
    file: File
  ): Promise<HTMLImageElement> {

    return new Promise(
      (resolve, reject) => {

        const url =
          URL.createObjectURL(file);

        const image =
          new Image();

        image.onload = () => {

          URL.revokeObjectURL(url);

          resolve(image);
        };

        image.onerror = () => {

          URL.revokeObjectURL(url);

          reject(
            new Error(
              'Unable to load image.'
            )
          );
        };

        image.src = url;
      }
    );
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: ImageFormat['value']
  ): Promise<Blob | null> {

    return new Promise(
      resolve => {

        /*
         * Quality is only meaningful for
         * lossy formats such as JPEG and WEBP.
         *
         * PNG ignores the quality parameter.
         */
        const quality =
          type === 'image/png'
            ? undefined
            : 0.92;

        canvas.toBlob(
          blob => resolve(blob),
          type,
          quality
        );
      }
    );
  }
}