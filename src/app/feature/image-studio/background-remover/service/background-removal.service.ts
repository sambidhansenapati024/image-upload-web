import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

@Injectable({
  providedIn: 'root'
})
export class BackgroundRemovalService {
  private remover: any = null;

  private loadingPromise: Promise<any> | null = null;

  constructor() {}

  async loadModel(): Promise<any> {

    if (this.remover) {
      return this.remover;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

this.loadingPromise = pipeline(
  'background-removal',
  'Xenova/modnet',
  {
    device: 'webgpu'
  }
);

    try {

      this.remover =
        await this.loadingPromise;

      return this.remover;

    } catch (error) {

      console.error(
        'Failed to load background removal model:',
        error
      );

      this.loadingPromise = null;

      throw error;
    }
  }

  async removeBackground(file: File): Promise<Blob> {

  const remover =
    await this.loadModel();

  const result =
    await remover(file);

  console.log(
    'Background removal result:',
    result
  );

  const blob =
  await result.toBlob();

  return blob;
}
}
