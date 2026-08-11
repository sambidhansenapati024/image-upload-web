import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

import { CollageTemplate } from '../../../shared/modal/collage-template';
import { COLLAGE_TEMPLATES } from '../../../shared/modal/collage-templates';
import { FormsModule } from '@angular/forms';
import { ImageUploadServiceService } from '../../../service/image-upload-service.service';

interface ImageSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-collage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collage.component.html',
  styleUrl: './collage.component.css'
})
export class CollageComponent implements OnDestroy {

  selectedFiles: File[] = [];

  validationMessage = '';

  imageCount = 0;
  uploading = false;

  availableTemplates: CollageTemplate[] = [];

  selectedTemplate?: CollageTemplate;
  backgroundColor: 'white' | 'black' | 'transparent' = 'white';

  imagePreviews: string[] = [];

  // Final generated collage
  generatedCollageUrl: string | null = null;
  generatedCollageFile: File | null = null;

  generatingCollage = false;

  outputFormat: 'jpeg' | 'png' = 'jpeg';

  outputQuality: 'high' | 'medium' | 'low' = 'high';

  uploadSuccessMessage = '';
uploadingCollage = false;

  constructor(
  private collageService: ImageUploadServiceService
) {}

ngOnDestroy(): void {

  this.revokeGeneratedCollageUrl();
}

  uploadCollage(): void {

      if (this.uploadingCollage) {
    return;
  }

  if (!this.generatedCollageFile) {

    this.validationMessage =
      'Please generate the collage first.';

    return;
  }

  if (!this.generatedCollageFile) {

    this.validationMessage =
      'Please generate the collage first.';

    return;
  }

  this.uploadingCollage = true;
  this.uploadSuccessMessage = '';
  this.validationMessage = '';

  this.collageService
    .uploadCollage(this.generatedCollageFile)
    .subscribe({

      next: (response) => {

        console.log(
          'Collage uploaded successfully:',
          response
        );

        this.uploadingCollage = false;

        this.uploadSuccessMessage =
          'Collage uploaded successfully!';

      },

      error: (error) => {

        console.error(
          'Collage upload failed:',
          error
        );

        this.uploadingCollage = false;

        this.validationMessage =
          'Failed to upload collage. Please try again.';
      }

    });
}


  // ============================================================
  // IMAGE SELECTION
  // ============================================================

  onFilesSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    this.selectedFiles = Array.from(input.files);

    this.imagePreviews = [];

    this.selectedTemplate = undefined;

    this.generatedCollageUrl = null;

    this.selectedFiles.forEach(file => {

      const reader = new FileReader();

      reader.onload = () => {

        this.imagePreviews.push(
          reader.result as string
        );

      };

      reader.readAsDataURL(file);

    });

    this.imageCount = this.selectedFiles.length;

    this.validationMessage = '';

    if (this.imageCount < 2) {

      this.validationMessage =
        'Please select at least 2 images.';

      this.availableTemplates = [];

      return;
    }

    if (this.imageCount > 4) {

      this.validationMessage =
        'Maximum 4 images are allowed.';

      this.availableTemplates = [];

      return;
    }

    this.availableTemplates =
      COLLAGE_TEMPLATES.filter(
        template => template.imageCount === this.imageCount
      );
  }


  // ============================================================
  // TEMPLATE SELECTION
  // ============================================================

  selectTemplate(template: CollageTemplate): void {

    this.selectedTemplate = template;

    // Remove previous generated collage
    this.generatedCollageUrl = null;
  }


  // ============================================================
  // GENERATE COLLAGE
  // ============================================================

  async generateCollage(): Promise<void> {

      if (this.generatingCollage) {
    return;
  }


    if (
    this.backgroundColor === 'transparent' &&
    this.outputFormat === 'jpeg'
) {
    this.validationMessage =
        'Transparent background is only available with PNG format.';
    return;
}

    if (!this.selectedTemplate) {

      this.validationMessage =
        'Please select a collage template.';

      return;
    }

    if (this.selectedFiles.length < 2) {

      this.validationMessage =
        'Please select at least 2 images.';

      return;
    }
        this.revokeGeneratedCollageUrl();
    this.generatedCollageFile = null;

    this.generatingCollage = true;

    try {

      const canvas = document.createElement('canvas');

      // Final collage size
      canvas.width = 1200;
      canvas.height = 800;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to create canvas context');
      }

if (this.backgroundColor === 'transparent') {

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

} else {

    context.fillStyle =
        this.backgroundColor === 'black'
            ? '#000000'
            : '#ffffff';

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

      const slots =
        this.getLayoutSlots(
          this.selectedTemplate.id
        );

      for (let i = 0; i < slots.length; i++) {

        if (!this.imagePreviews[i]) {
          continue;
        }

        const image =
          await this.loadImage(
            this.imagePreviews[i]
          );

        this.drawImageCover(
          context,
          image,
          slots[i]
        );

      }

     const mimeType =
  this.outputFormat === 'png'
    ? 'image/png'
    : 'image/jpeg';

const quality =
  this.outputQuality === 'high'
    ? 0.92
    : this.outputQuality === 'medium'
      ? 0.75
      : 0.5;

const blob = await new Promise<Blob | null>((resolve) => {

  canvas.toBlob(
    resolve,
    mimeType,
    quality
  );

});

if (!blob) {

  throw new Error(
    'Unable to generate collage'
  );
}

this.generatedCollageFile =
  new File(
    [blob],
    `my-collage.${this.outputFormat === 'png' ? 'png' : 'jpg'}`,
    {
      type: mimeType
    }
  );

this.generatedCollageUrl =
  URL.createObjectURL(blob);

    } catch (error) {

      console.error(
        'Collage generation failed:',
        error
      );

      this.validationMessage =
        'Unable to generate collage. Please try again.';

    } finally {

      this.generatingCollage = false;
    }
  }


  // ============================================================
  // LOAD IMAGE
  // ============================================================

  private loadImage(
    source: string
  ): Promise<HTMLImageElement> {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () =>
        reject(
          new Error('Unable to load image')
        );

      image.src = source;

    });
  }


  // ============================================================
  // DRAW IMAGE WITH OBJECT-COVER BEHAVIOUR
  // ============================================================

  private drawImageCover(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    slot: ImageSlot
  ): void {

    const imageRatio =
      image.width / image.height;

    const slotRatio =
      slot.width / slot.height;

    let sourceWidth = image.width;
    let sourceHeight = image.height;

    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > slotRatio) {

      // Image is wider
      sourceWidth =
        image.height * slotRatio;

      sourceX =
        (image.width - sourceWidth) / 2;

    } else {

      // Image is taller
      sourceHeight =
        image.width / slotRatio;

      sourceY =
        (image.height - sourceHeight) / 2;
    }

    context.drawImage(
      image,

      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,

      slot.x,
      slot.y,
      slot.width,
      slot.height
    );
  }


  // ============================================================
  // TEMPLATE LAYOUTS
  // ============================================================

  private getLayoutSlots(
    templateId: string
  ): ImageSlot[] {

    const gap = 8;

    const width = 1200;

    const height = 800;


    switch (templateId) {

      // --------------------------------------------------------
      // 2 IMAGES
      // --------------------------------------------------------

      case 'SIDE_BY_SIDE':

        return [
          {
            x: 0,
            y: 0,
            width: (width - gap) / 2,
            height
          },
          {
            x: (width + gap) / 2,
            y: 0,
            width: (width - gap) / 2,
            height
          }
        ];


      case 'TOP_BOTTOM':

        return [
          {
            x: 0,
            y: 0,
            width,
            height: (height - gap) / 2
          },
          {
            x: 0,
            y: (height + gap) / 2,
            width,
            height: (height - gap) / 2
          }
        ];


      case 'BIG_LEFT':

        return [
          {
            x: 0,
            y: 0,
            width: width * 0.66 - gap,
            height
          },
          {
            x: width * 0.66,
            y: 0,
            width: width * 0.34,
            height
          }
        ];


      case 'BIG_RIGHT':

        return [
          {
            x: 0,
            y: 0,
            width: width * 0.34,
            height
          },
          {
            x: width * 0.34 + gap,
            y: 0,
            width: width * 0.66 - gap,
            height
          }
        ];


      // --------------------------------------------------------
      // 3 IMAGES
      // --------------------------------------------------------

      case 'EQUAL_COLUMNS':

        return [
          {
            x: 0,
            y: 0,
            width: (width - gap * 2) / 3,
            height
          },
          {
            x: (width - gap * 2) / 3 + gap,
            y: 0,
            width: (width - gap * 2) / 3,
            height
          },
          {
            x: ((width - gap * 2) / 3) * 2 + gap * 2,
            y: 0,
            width: (width - gap * 2) / 3,
            height
          }
        ];


      case 'LARGE_TOP_TWO_BOTTOM':

        return [
          {
            x: 0,
            y: 0,
            width,
            height: height * 0.66 - gap
          },
          {
            x: 0,
            y: height * 0.66,
            width: (width - gap) / 2,
            height: height * 0.34
          },
          {
            x: (width + gap) / 2,
            y: height * 0.66,
            width: (width - gap) / 2,
            height: height * 0.34
          }
        ];


      case 'LARGE_LEFT_TWO_RIGHT':

        return [
          {
            x: 0,
            y: 0,
            width: width * 0.66 - gap,
            height
          },
          {
            x: width * 0.66,
            y: 0,
            width: width * 0.34,
            height: (height - gap) / 2
          },
          {
            x: width * 0.66,
            y: (height + gap) / 2,
            width: width * 0.34,
            height: (height - gap) / 2
          }
        ];


      // --------------------------------------------------------
      // 4 IMAGES
      // --------------------------------------------------------

      case 'GRID_2X2':

        return [

          {
            x: 0,
            y: 0,
            width: (width - gap) / 2,
            height: (height - gap) / 2
          },

          {
            x: (width + gap) / 2,
            y: 0,
            width: (width - gap) / 2,
            height: (height - gap) / 2
          },

          {
            x: 0,
            y: (height + gap) / 2,
            width: (width - gap) / 2,
            height: (height - gap) / 2
          },

          {
            x: (width + gap) / 2,
            y: (height + gap) / 2,
            width: (width - gap) / 2,
            height: (height - gap) / 2
          }

        ];


      case 'LARGE_LEFT_THREE_RIGHT':

        return [

          {
            x: 0,
            y: 0,
            width: width * 0.66 - gap,
            height
          },

          {
            x: width * 0.66,
            y: 0,
            width: width * 0.34,
            height: (height - gap * 2) / 3
          },

          {
            x: width * 0.66,
            y: (height - gap * 2) / 3 + gap,
            width: width * 0.34,
            height: (height - gap * 2) / 3
          },

          {
            x: width * 0.66,
            y: ((height - gap * 2) / 3) * 2 + gap * 2,
            width: width * 0.34,
            height: (height - gap * 2) / 3
          }

        ];


      case 'LARGE_TOP_THREE_BOTTOM':

        return [

          {
            x: 0,
            y: 0,
            width: width,
            height: height * 0.66 - gap
          },

          {
            x: 0,
            y: height * 0.66,
            width: (width - gap * 2) / 3,
            height: height * 0.34
          },

          {
            x: (width - gap * 2) / 3 + gap,
            y: height * 0.66,
            width: (width - gap * 2) / 3,
            height: height * 0.34
          },

          {
            x: ((width - gap * 2) / 3) * 2 + gap * 2,
            y: height * 0.66,
            width: (width - gap * 2) / 3,
            height: height * 0.34
          }

        ];


      default:

        return [];

    }
  }


  // ============================================================
  // DOWNLOAD
  // ============================================================

  downloadCollage(): void {

  if (!this.generatedCollageFile) {
    return;
  }

  const url =
    URL.createObjectURL(
      this.generatedCollageFile
    );

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    this.generatedCollageFile.name;

  link.click();

  URL.revokeObjectURL(url);
}

  resetCollage(): void {

  this.selectedFiles = [];

  this.imagePreviews = [];

  this.imageCount = 0;

  this.availableTemplates = [];

  this.selectedTemplate = undefined;

  this.revokeGeneratedCollageUrl();

this.generatedCollageFile = null;
  this.uploadSuccessMessage = '';
this.uploadingCollage = false;
  this.generatedCollageFile = null;

  this.validationMessage = '';

  this.generatingCollage = false;
}

private revokeGeneratedCollageUrl(): void {

  if (this.generatedCollageUrl) {

    URL.revokeObjectURL(
      this.generatedCollageUrl
    );

    this.generatedCollageUrl = null;
  }
}

moveImage(index: number, direction: 'up' | 'down'): void {

  const newIndex =
    direction === 'up'
      ? index - 1
      : index + 1;

  if (newIndex < 0 || newIndex >= this.selectedFiles.length) {
    return;
  }

  // Swap files
  [
    this.selectedFiles[index],
    this.selectedFiles[newIndex]
  ] = [
    this.selectedFiles[newIndex],
    this.selectedFiles[index]
  ];

  // Swap previews
  [
    this.imagePreviews[index],
    this.imagePreviews[newIndex]
  ] = [
    this.imagePreviews[newIndex],
    this.imagePreviews[index]
  ];
}

removeImage(index: number): void {

  this.selectedFiles.splice(index, 1);

  this.imagePreviews.splice(index, 1);

  this.imageCount = this.selectedFiles.length;

  // Clear previous template selection
  this.selectedTemplate = undefined;

  // Clear generated collage
  this.generatedCollageUrl = null;

  this.validationMessage = '';

  // Recalculate available templates
  if (this.imageCount < 2) {

    this.availableTemplates = [];

    if (this.imageCount === 1) {
      this.validationMessage =
        'Please select at least 2 images.';
    }

    return;
  }

  if (this.imageCount > 4) {

    this.availableTemplates = [];

    this.validationMessage =
      'Maximum 4 images are allowed.';

    return;
  }

  this.availableTemplates =
    COLLAGE_TEMPLATES.filter(
      template => template.imageCount === this.imageCount
    );
}

}