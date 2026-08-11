import { Injectable } from '@angular/core';

import {
  pipeline
} from '@huggingface/transformers';


@Injectable({
  providedIn: 'root'
})
export class BackgroundRemovalService {

  private remover: any = null;

  private loadingPromise: Promise<any> | null = null;

  private device: 'webgpu' | 'wasm' = 'wasm';


  constructor() {}

  private isWebGPUSupported(): boolean {

  return (
    typeof navigator !== 'undefined' &&
    'gpu' in navigator
  );

}


  async loadModel(): Promise<any> {

  if (this.remover) {
    return this.remover;
  }

  if (this.loadingPromise) {
    return this.loadingPromise;
  }


  // =====================================
  // CHECK WEBGPU SUPPORT
  // =====================================

  const webGPUSupported =
    this.isWebGPUSupported();


  console.log(
    'WebGPU supported:',
    webGPUSupported
  );


  const device =
    webGPUSupported
      ? 'webgpu'
      : 'wasm';


  console.log(
    `Using ${device} for background removal.`
  );


  // =====================================
  // LOAD MODEL
  // =====================================

  this.loadingPromise =
    pipeline(
      'background-removal',
      'Xenova/modnet',
      {
        device
      }
    );


  try {

    this.remover =
      await this.loadingPromise;


    console.log(
      `Background removal model loaded using ${device}.`
    );


    return this.remover;


  } catch (error) {

    console.error(
      `Failed to load model using ${device}:`,
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