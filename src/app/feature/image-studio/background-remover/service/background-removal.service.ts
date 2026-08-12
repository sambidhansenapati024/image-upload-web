import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

@Injectable({
  providedIn: 'root'
})
export class BackgroundRemovalService {

  private remover: any = null;

  private loadingPromise: Promise<any> | null = null;

  private device: 'webgpu' | 'wasm' = 'wasm';


  constructor() {}


  // ============================================
  // CHECK IF BROWSER EXPOSES WEBGPU
  // ============================================

  private isWebGPUSupported(): boolean {

    return (
      typeof navigator !== 'undefined' &&
      'gpu' in navigator
    );

  }


  // ============================================
  // LOAD MODEL
  // ============================================

  async loadModel(): Promise<any> {

    // Already loaded
    if (this.remover) {
      return this.remover;
    }


    // Already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }


    const webGPUSupported =
      this.isWebGPUSupported();



    // ============================================
    // WEBGPU AVAILABLE
    // ============================================

    if (webGPUSupported) {


      try {

        this.device = 'webgpu';


        this.loadingPromise =
          pipeline(
            'background-removal',
            'Xenova/modnet',
            {
              device: 'webgpu'
            }
          );


        this.remover =
          await this.loadingPromise;

        return this.remover;


      } catch (webGpuError) {

        console.warn(
          'WebGPU model initialization failed.',
          webGpuError
        );


        // Clear failed state
        this.remover = null;
        this.loadingPromise = null;

      }

    } else {

    }


    // ============================================
    // WASM FALLBACK
    // ============================================

    try {

      this.device = 'wasm';


      this.loadingPromise =
        pipeline(
          'background-removal',
          'Xenova/modnet',
          {
            device: 'wasm'
          }
        );


      this.remover =
        await this.loadingPromise;



      return this.remover;


    } catch (wasmError) {

      console.error(
        'Failed to load MODNet using WASM.',
        wasmError
      );


      this.remover = null;
      this.loadingPromise = null;


      throw wasmError;

    }

  }


  // ============================================
  // REMOVE BACKGROUND
  // ============================================

  async removeBackground(file: File): Promise<Blob> {

    const remover =
      await this.loadModel();


    const result =
      await remover(file);



    const blob =
      await result.toBlob();


    return blob;

  }

}