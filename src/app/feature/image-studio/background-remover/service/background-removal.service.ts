import { Injectable } from '@angular/core';

import {
  AutoModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor,
  env,
} from '@huggingface/transformers';


/*
 * ============================================================
 * TRANSFORMERS.JS BROWSER CONFIGURATION
 * ============================================================
 */

/*
 * Models are downloaded from Hugging Face.
 */
env.allowLocalModels = false;
env.allowRemoteModels = true;

/*
 * Cache downloaded models in the browser whenever possible.
 */
env.useBrowserCache = true;

if (env.backends?.onnx?.wasm) {

  // Don't use a separate WASM worker for now.
  env.backends.onnx.wasm.proxy = false;

  // WASM files are served by Angular from /public/ort/
  // which becomes /ort/ after ng build.
  env.backends.onnx.wasm.wasmPaths = '/ort/';
}

/*
 * WASM configuration.
 *
 * Proxy keeps the WASM work away from the main UI thread.
 */
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
}


/*
 * ============================================================
 * SERVICE
 * ============================================================
 */

@Injectable({
  providedIn: 'root',
})
export class BackgroundRemovalService {

  private model: PreTrainedModel | null = null;

  private processor: Processor | null = null;

  private loadingPromise:
    Promise<{
      model: PreTrainedModel;
      processor: Processor;
    }> | null = null;

  /*
   * Always start with WASM.
   *
   * This is intentional.
   *
   * Your deployed application was failing when WebGPU was
   * selected even though navigator.gpu existed.
   */
  private device: 'webgpu' | 'wasm' = 'wasm';


  /*
   * ============================================================
   * WEBGPU CHECK
   * ============================================================
   */

  private isWebGPUPossiblyAvailable(): boolean {

    if (typeof window === 'undefined') {
      return false;
    }

    if (typeof navigator === 'undefined') {
      return false;
    }

    /*
     * Just checking navigator.gpu isn't enough to guarantee
     * that WebGPU can actually create a working device.
     *
     * This function is only used as an optional optimization.
     */
    return 'gpu' in navigator &&
      !!(navigator as any).gpu;
  }


  /*
   * ============================================================
   * LOAD MODEL
   * ============================================================
   */

  async loadModel(): Promise<{
    model: PreTrainedModel;
    processor: Processor;
  }> {

    /*
     * Already loaded.
     */
    if (
      this.model &&
      this.processor
    ) {

      return {
        model: this.model,
        processor: this.processor,
      };
    }


    /*
     * Another load operation is already running.
     */
    if (this.loadingPromise) {
      return this.loadingPromise;
    }


    /*
     * ========================================================
     * MODEL LOADER
     * ========================================================
     */

    const tryLoad = async (
      device: 'webgpu' | 'wasm'
    ) => {

      console.log(
        `Loading RMBG-1.4 using ${device.toUpperCase()}...`
      );


      /*
       * --------------------------------------------------------
       * MODEL
       * --------------------------------------------------------
       */

      const model =
        await AutoModel.from_pretrained(
          'briaai/RMBG-1.4',
          {
            /*
             * RMBG-1.4's config.json cannot be automatically
             * mapped to a standard pipeline task.
             */
            config: {
              model_type: 'custom',
            } as any,

            device,
          }
        );


      /*
       * --------------------------------------------------------
       * PROCESSOR
       * --------------------------------------------------------
       */

      const processor =
        await AutoProcessor.from_pretrained(
          'briaai/RMBG-1.4',
          {
            config: {
              do_normalize: true,
              do_pad: false,
              do_rescale: true,
              do_resize: true,

              image_mean: [
                0.5,
                0.5,
                0.5,
              ],

              image_std: [
                1,
                1,
                1,
              ],

              feature_extractor_type:
                'ImageFeatureExtractor',

              resample: 2,

              rescale_factor:
                1 / 255,

              size: {
                width: 1024,
                height: 1024,
              },

            } as any,
          }
        );


      /*
       * Remember the backend that successfully loaded.
       */
      this.device = device;


      return {
        model,
        processor,
      };
    };


    /*
     * ========================================================
     * LOADING STRATEGY
     * ========================================================
     *
     * IMPORTANT:
     *
     * WASM is our reliable production backend.
     *
     * WebGPU is optional.
     *
     * We don't want a WebGPU failure to break the entire
     * background-removal feature.
     */

    this.loadingPromise = (async () => {

      /*
       * ------------------------------------------------------
       * PRODUCTION-SAFE OPTION
       * ------------------------------------------------------
       *
       * Start with WASM.
       *
       * This avoids the exact WebGPU problem you're seeing
       * after deployment.
       */

      try {

        console.log(
          'Starting background removal with WASM...'
        );

        const result =
          await tryLoad('wasm');

        this.model =
          result.model;

        this.processor =
          result.processor;

        this.device =
          'wasm';

        console.log(
          'RMBG-1.4 successfully loaded using WASM.'
        );

        return result;

      } catch (wasmError) {

        console.error(
          'WASM backend failed:',
          wasmError
        );

        /*
         * ----------------------------------------------------
         * OPTIONAL WEBGPU FALLBACK
         * ----------------------------------------------------
         *
         * If WASM fails, we can still attempt WebGPU.
         */

        if (
          this.isWebGPUPossiblyAvailable()
        ) {

          console.warn(
            'WASM failed. Trying WebGPU as a fallback...'
          );

          try {

            const result =
              await tryLoad('webgpu');

            this.model =
              result.model;

            this.processor =
              result.processor;

            this.device =
              'webgpu';

            console.log(
              'RMBG-1.4 successfully loaded using WebGPU.'
            );

            return result;

          } catch (webGpuError) {

            console.error(
              'WebGPU fallback also failed:',
              webGpuError
            );

            throw new Error(
              'Background removal AI could not initialize. ' +
              'Both WASM and WebGPU backends failed.'
            );
          }
        }

        /*
         * No WebGPU available.
         */
        throw new Error(
          'Background removal AI could not initialize. ' +
          'The WASM backend failed and WebGPU is unavailable.'
        );
      }

    })();


    /*
     * ========================================================
     * HANDLE LOADING FAILURE
     * ========================================================
     */

    try {

      return await this.loadingPromise;

    } catch (error) {

      /*
       * Allow retryModelLoading() to work again.
       */
      this.loadingPromise = null;

      this.model = null;

      this.processor = null;

      throw error;
    }
  }


  /*
   * ============================================================
   * REMOVE BACKGROUND
   * ============================================================
   */

  async removeBackground(
    file: File
  ): Promise<Blob> {

    /*
     * Make sure the model exists.
     */
    const {
      model,
      processor
    } = await this.loadModel();


    console.log(
      `Removing background using ${this.device.toUpperCase()}...`
    );


    /*
     * ========================================================
     * LOAD IMAGE
     * ========================================================
     */

    const url =
      URL.createObjectURL(file);

    let image: RawImage;

    try {

      image =
        await RawImage.fromURL(url);

    } finally {

      URL.revokeObjectURL(url);
    }


    /*
     * ========================================================
     * PRE-PROCESS
     * ========================================================
     */

    const {
      pixel_values
    } = await processor(image);


    /*
     * ========================================================
     * MODEL INFERENCE
     * ========================================================
     */

    const {
      output
    } = await model({
      input: pixel_values
    });


    /*
     * ========================================================
     * CREATE ALPHA MASK
     * ========================================================
     */

    const maskTensor =
      output[0]
        .mul(255)
        .to('uint8');


    const mask =
      await RawImage
        .fromTensor(maskTensor)
        .resize(
          image.width,
          image.height
        );


    /*
     * ========================================================
     * CREATE TRANSPARENT CANVAS
     * ========================================================
     */

    const canvas =
      document.createElement('canvas');

    canvas.width =
      image.width;

    canvas.height =
      image.height;


    const ctx =
      canvas.getContext('2d');


    if (!ctx) {

      throw new Error(
        'Could not get canvas context.'
      );
    }


    /*
     * Draw original image.
     */
    ctx.drawImage(
      image.toCanvas(),
      0,
      0
    );


    /*
     * ========================================================
     * APPLY ALPHA MASK
     * ========================================================
     */

    const pixelData =
      ctx.getImageData(
        0,
        0,
        image.width,
        image.height
      );


    for (
      let i = 0;
      i < mask.data.length;
      ++i
    ) {

      pixelData.data[
        4 * i + 3
      ] =
        mask.data[i];
    }


    ctx.putImageData(
      pixelData,
      0,
      0
    );


    /*
     * ========================================================
     * EXPORT PNG
     * ========================================================
     */

    return await new Promise<Blob>(
      (resolve, reject) => {

        canvas.toBlob(
          (blob) => {

            if (blob) {

              resolve(blob);

            } else {

              reject(
                new Error(
                  'Failed to create PNG blob from canvas.'
                )
              );
            }

          },
          'image/png'
        );

      }
    );
  }
}