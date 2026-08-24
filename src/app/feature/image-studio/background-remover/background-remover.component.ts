import {
  Component,
  OnInit
} from '@angular/core';

import {
  BackgroundRemovalService
} from './service/background-removal.service';


@Component({
  selector: 'app-background-remover',
  standalone: true,
  imports: [],
  templateUrl: './background-remover.component.html',
  styleUrl: './background-remover.component.css'
})
export class BackgroundRemoverComponent
  implements OnInit {


  selectedFile:
    File | null = null;


  originalPreview:
    string | null = null;


  backgroundRemovedPreview:
    string | null = null;


  downloadFile:
    File | null = null;


  history:
    (string | null)[] = [];


  historyIndex =
    -1;


  validationMessage =
    '';


  processing =
    false;


  modelLoading =
    true;


  modelReady =
    false;


  modelError =
    false;


  originalSize =
    0;


  originalWidth =
    0;


  originalHeight =
    0;


  removedSize =
    0;


  removedWidth =
    0;


  removedHeight =
    0;


  constructor(
    private backgroundRemovalService:
      BackgroundRemovalService
  ) {}


  /*
   * ==========================================================
   * INITIALIZE MODEL
   * ==========================================================
   */

  async ngOnInit(): Promise<void> {

    await this.initializeModel();
  }


  private async initializeModel(): Promise<void> {

    console.log(
      'Initializing background removal AI...'
    );


    this.modelLoading =
      true;

    this.modelReady =
      false;

    this.modelError =
      false;

    this.validationMessage =
      '';


    try {

      await this.backgroundRemovalService
        .loadModel();


      this.modelReady =
        true;


      console.log(
        'Background removal AI is ready.'
      );


    } catch (error) {

      console.error(
        'Failed to initialize background removal AI:',
        error
      );


      this.modelError =
        true;


      this.validationMessage =
        'Background removal AI could not be loaded. ' +
        'Please check your internet connection and try again.';


    } finally {

      this.modelLoading =
        false;
    }
  }


  /*
   * ==========================================================
   * RETRY
   * ==========================================================
   */

  async retryModelLoading(): Promise<void> {

    if (this.modelLoading) {
      return;
    }


    await this.initializeModel();
  }


  /*
   * ==========================================================
   * FILE SELECTION
   * ==========================================================
   */

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;
    }


    const file =
      input.files[0];


    this.validationMessage =
      '';


    if (
      !file.type.startsWith('image/')
    ) {

      this.validationMessage =
        'Please select a valid image file.';

      return;
    }


    /*
     * Clean previous previews.
     */
    if (this.originalPreview) {

      URL.revokeObjectURL(
        this.originalPreview
      );
    }


    if (this.backgroundRemovedPreview) {

      URL.revokeObjectURL(
        this.backgroundRemovedPreview
      );
    }


    /*
     * Reset result state.
     */
    this.backgroundRemovedPreview =
      null;

    this.downloadFile =
      null;

    this.history =
      [];

    this.historyIndex =
      -1;


    this.removedSize =
      0;

    this.removedWidth =
      0;

    this.removedHeight =
      0;


    /*
     * Set selected file.
     */
    this.selectedFile =
      file;


    this.originalSize =
      file.size;


    /*
     * Create original preview.
     */
    this.originalPreview =
      URL.createObjectURL(file);


    /*
     * Get original dimensions.
     */
    const image =
      new Image();


    const dimensionUrl =
      URL.createObjectURL(file);


    image.onload = () => {

      this.originalWidth =
        image.naturalWidth;

      this.originalHeight =
        image.naturalHeight;


      URL.revokeObjectURL(
        dimensionUrl
      );
    };


    image.onerror = () => {

      URL.revokeObjectURL(
        dimensionUrl
      );
    };


    image.src =
      dimensionUrl;


    console.log(
      'Selected file:',
      this.selectedFile
    );
  }


  /*
   * ==========================================================
   * REMOVE BACKGROUND
   * ==========================================================
   */

  async removeBackground(): Promise<void> {

    if (!this.selectedFile) {

      this.validationMessage =
        'Please select an image first.';

      return;
    }


    if (this.processing) {
      return;
    }


    /*
     * If the model isn't ready, don't attempt inference.
     */
    if (!this.modelReady) {

      this.validationMessage =
        this.modelError
          ? 'Background removal AI is not available. Please retry loading the AI model.'
          : 'Background removal AI is still loading. Please wait a moment.';

      return;
    }


    this.processing =
      true;


    this.validationMessage =
      '';


    try {

      console.log(
        'Starting background removal...'
      );


      const result =
        await this.backgroundRemovalService
          .removeBackground(
            this.selectedFile
          );


      console.log(
        'Background removed successfully:',
        result
      );


      /*
       * Revoke previous result preview.
       */
      if (
        this.backgroundRemovedPreview
      ) {

        URL.revokeObjectURL(
          this.backgroundRemovedPreview
        );
      }


      /*
       * Create result preview.
       */
      this.backgroundRemovedPreview =
        URL.createObjectURL(result);


      /*
       * History.
       */
      this.history = [
        null,
        this.backgroundRemovedPreview
      ];


      this.historyIndex =
        1;


      /*
       * Download file.
       */
      this.downloadFile =
        new File(
          [result],
          this.getOutputFileName(),
          {
            type: 'image/png'
          }
        );


      /*
       * Result size.
       */
      this.removedSize =
        result.size;


      /*
       * Result dimensions.
       */
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
        this.getReadableError(error);


    } finally {

      this.processing =
        false;
    }
  }


  /*
   * ==========================================================
   * ERROR MESSAGE
   * ==========================================================
   */

  private getReadableError(
    error: unknown
  ): string {

    const message =
      error instanceof Error
        ? error.message
        : String(error);


    if (
      message.includes(
        'no available backend'
      )
    ) {

      return (
        'The AI backend could not be initialized. ' +
        'Please refresh the page and try again.'
      );
    }


    if (
      message.includes(
        'global is not defined'
      )
    ) {

      return (
        'The browser AI runtime could not be initialized. ' +
        'Please refresh the page and try again.'
      );
    }


    return (
      'Unable to remove background. ' +
      'Please try again.'
    );
  }


  /*
   * ==========================================================
   * UNDO
   * ==========================================================
   */

  undo(): void {

    if (!this.canUndo) {
      return;
    }


    this.historyIndex--;


    this.backgroundRemovedPreview =
      this.history[
        this.historyIndex
      ];
  }


  /*
   * ==========================================================
   * REDO
   * ==========================================================
   */

  redo(): void {

    if (!this.canRedo) {
      return;
    }


    this.historyIndex++;


    this.backgroundRemovedPreview =
      this.history[
        this.historyIndex
      ];
  }


  /*
   * ==========================================================
   * FILE SIZE
   * ==========================================================
   */

  formatFileSize(
    bytes: number
  ): string {

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
        Math.log(bytes) /
        Math.log(1024)
      );


    return (
      parseFloat(
        (
          bytes /
          Math.pow(
            1024,
            index
          )
        ).toFixed(2)
      )
      +
      ' ' +
      units[index]
    );
  }


  /*
   * ==========================================================
   * OUTPUT FILE NAME
   * ==========================================================
   */

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
        ? originalName.substring(
            0,
            dotIndex
          )
        : originalName;


    return (
      `${name}-background-removed.png`
    );
  }


  /*
   * ==========================================================
   * DOWNLOAD
   * ==========================================================
   */

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


    link.href =
      url;


    link.download =
      this.downloadFile.name;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    /*
     * Give the browser time to start
     * the download before revoking.
     */
    setTimeout(() => {

      URL.revokeObjectURL(
        url
      );

    }, 1000);
  }


  /*
   * ==========================================================
   * UNDO / REDO STATE
   * ==========================================================
   */

  get canUndo(): boolean {

    return (
      this.historyIndex > 0
    );
  }


  get canRedo(): boolean {

    return (
      this.historyIndex >= 0 &&
      this.historyIndex <
        this.history.length - 1
    );
  }


  /*
   * ==========================================================
   * RESET
   * ==========================================================
   */

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


    this.selectedFile =
      null;


    this.originalPreview =
      null;


    this.backgroundRemovedPreview =
      null;


    this.downloadFile =
      null;


    this.originalSize =
      0;


    this.originalWidth =
      0;


    this.originalHeight =
      0;


    this.removedSize =
      0;


    this.removedWidth =
      0;


    this.removedHeight =
      0;


    this.history =
      [];


    this.historyIndex =
      -1;


    this.validationMessage =
      '';
  }
}