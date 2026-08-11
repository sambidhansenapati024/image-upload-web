import { Component } from '@angular/core';
import { BackgroundRemovalService } from './service/background-removal.service';

@Component({
  selector: 'app-background-remover',
  imports: [],
  templateUrl: './background-remover.component.html',
  styleUrl: './background-remover.component.css'
})
export class BackgroundRemoverComponent {

   selectedFile: File | null = null;
   originalPreview: string | null = null;

   backgroundRemovedPreview: string | null = null;
   downloadFile: File | null = null;
   history: (string | null)[] = [];

historyIndex = -1;

  validationMessage = '';
  processing = false;
  originalSize = 0;

originalWidth = 0;
originalHeight = 0;

removedSize = 0;

removedWidth = 0;
removedHeight = 0;

  constructor(
    private backgroundRemovalService: BackgroundRemovalService
  ) {}

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.validationMessage = '';

    if (!file.type.startsWith('image/')) {

      this.validationMessage =
        'Please select a valid image file.';

      return;
    }

    this.selectedFile = file;
    this.originalSize = file.size;

const image =
  new Image();

image.onload = () => {

  this.originalWidth =
    image.naturalWidth;

  this.originalHeight =
    image.naturalHeight;

};

image.src =
  URL.createObjectURL(file);
    const reader = new FileReader();

reader.onload = () => {

  this.originalPreview =
    reader.result as string;

};

reader.readAsDataURL(file);

    console.log(
      'Selected file:',
      this.selectedFile
    );
  }


  async removeBackground(): Promise<void> {

  if (!this.selectedFile) {

    this.validationMessage =
      'Please select an image first.';

    return;
  }

  if (this.processing) {
    return;
  }

  this.processing = true;

  this.validationMessage = '';

  try {

    console.log(
      'Starting background removal...'
    );

    const result =
      await this.backgroundRemovalService
        .removeBackground(this.selectedFile);

    console.log(
      'Background removed successfully:',
      result
    );

    if (this.backgroundRemovedPreview) {

      URL.revokeObjectURL(
        this.backgroundRemovedPreview
      );

    }

    this.backgroundRemovedPreview =
      URL.createObjectURL(result);

this.history = [
  null,
  this.backgroundRemovedPreview
];

this.historyIndex = 1;

      this.downloadFile = new File(
  [result],
  this.getOutputFileName(),
  {
    type: 'image/png'
  }
);

      this.removedSize =
  result.size;

const resultImage =
  new Image();

resultImage.onload = () => {

  this.removedWidth =
    resultImage.naturalWidth;

  this.removedHeight =
    resultImage.naturalHeight;

};

resultImage.src =
  this.backgroundRemovedPreview;

  } catch (error) {

    console.error(
      'Background removal failed:',
      error
    );

    this.validationMessage =
      'Unable to remove background. Please try again.';

  } finally {

    this.processing = false;

  }

}

undo(): void {

  if (!this.canUndo) {
    return;
  }

  this.historyIndex--;

  this.backgroundRemovedPreview =
    this.history[this.historyIndex];

}

redo(): void {

  if (!this.canRedo) {
    return;
  }

  this.historyIndex++;

  this.backgroundRemovedPreview =
    this.history[this.historyIndex];

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
      (
        bytes /
        Math.pow(1024, index)
      ).toFixed(2)
    )
    +
    ' ' +
    units[index]
  );
}

private getOutputFileName(): string {

  if (!this.selectedFile) {
    return 'background-removed.png';
  }

  const originalName =
    this.selectedFile.name;

  const dotIndex =
    originalName.lastIndexOf('.');

  const name =
    dotIndex > 0
      ? originalName.substring(0, dotIndex)
      : originalName;

  return `${name}-background-removed.png`;
}

downloadBackgroundRemoved(): void {

  if (!this.downloadFile) {
    return;
  }

  const url =
    URL.createObjectURL(
      this.downloadFile
    );

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    this.downloadFile.name;

  link.click();

  URL.revokeObjectURL(url);
}

get canUndo(): boolean {

  return this.historyIndex > 0;

}

get canRedo(): boolean {

  return (
    this.historyIndex >= 0 &&
    this.historyIndex < this.history.length - 1
  );

}

reset(): void {

  if (this.backgroundRemovedPreview) {

    URL.revokeObjectURL(
      this.backgroundRemovedPreview
    );

  }

  if (this.originalPreview) {

    URL.revokeObjectURL(
      this.originalPreview
    );

  }

  this.selectedFile = null;

  this.originalPreview = null;

  this.backgroundRemovedPreview = null;

  this.downloadFile = null;

  this.originalSize = 0;

  this.originalWidth = 0;

  this.originalHeight = 0;

  this.removedSize = 0;

  this.removedWidth = 0;

  this.removedHeight = 0;

  this.history = [];

  this.historyIndex = -1;

  this.validationMessage = '';

  //this.uploadSuccess = false;

}

}
