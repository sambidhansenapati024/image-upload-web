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

// Models are downloaded from Hugging Face.
env.allowLocalModels = false;
env.allowRemoteModels = true;

/*
 * ============================================================
 * ONNX WASM CONFIGURATION
 * ============================================================
 *
 * The ONNX WASM runtime files are copied to:
 *
 * public/ort/
 *
 * Angular serves that folder as:
 *
 * /ort/
 *
 * We use WASM only for now.
 *
 * We intentionally DO NOT use WebGPU fallback because your
 * production deployment was reporting:
 *
 * "no available backend found"
 *
 * when WebGPU was attempted.
 */

if (env.backends?.onnx?.wasm) {

  // Run WASM directly instead of using a separate worker.
  env.backends.onnx.wasm.proxy = false;

  // Tell ONNX Runtime exactly where the WASM files are.
  env.backends.onnx.wasm.wasmPaths = '/ort/';
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
   * We intentionally use WASM only.
   */
  private device: 'wasm' = 'wasm';


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
     * ----------------------------------------------------------
     * Already loaded
     * ----------------------------------------------------------
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
     * ----------------------------------------------------------
     * Prevent duplicate model loading
     * ----------------------------------------------------------
     */

    if (this.loadingPromise) {
      return this.loadingPromise;
    }


    /*
     * ----------------------------------------------------------
     * MODEL LOADER
     * ----------------------------------------------------------
     */

    const tryLoad = async () => {

      console.log(
        'Loading RMBG-1.4 using WASM...'
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

            /*
             * IMPORTANT:
             *
             * WASM only.
             */
            device: 'wasm',
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
       * --------------------------------------------------------
       * Save successful model + processor
       * --------------------------------------------------------
       */

      this.model = model;

      this.processor = processor;

      this.device = 'wasm';


      console.log(
        'RMBG-1.4 successfully loaded using WASM.'
      );


      return {
        model,
        processor,
      };

    };


    /*
     * ==========================================================
     * WASM ONLY LOADING
     * ==========================================================
     */

    this.loadingPromise =
      (async () => {

        try {

          console.log(
            'Starting background removal with WASM...'
          );

          const result =
            await tryLoad();

          return result;

        } catch (error) {

          console.error(
            'WASM backend failed:',
            error
          );

          /*
           * Do NOT attempt WebGPU.
           *
           * The production environment was previously
           * failing during WebGPU initialization.
           */

          throw new Error(
            'Background removal AI could not initialize using WASM.'
          );

        }

      })();


    /*
     * ==========================================================
     * HANDLE LOADING FAILURE
     * ==========================================================
     */

    try {

      return await this.loadingPromise;

    } catch (error) {

      /*
       * Allow the component's retryModelLoading()
       * to attempt loading again.
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
      processor,
    } = await this.loadModel();


    console.log(
      `Removing background using ${this.device.toUpperCase()}...`
    );


    /*
     * ==========================================================
     * LOAD IMAGE
     * ==========================================================
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
     * ==========================================================
     * PRE-PROCESS
     * ==========================================================
     */

    const {
      pixel_values,
    } = await processor(image);


    /*
     * ==========================================================
     * MODEL INFERENCE
     * ==========================================================
     */

    const {
      output,
    } = await model({
      input: pixel_values,
    });


    /*
     * ==========================================================
     * CREATE ALPHA MASK
     * ==========================================================
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
     * ==========================================================
     * CREATE TRANSPARENT CANVAS
     * ==========================================================
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
     * ==========================================================
     * APPLY ALPHA MASK
     * ==========================================================
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
     * ==========================================================
     * EXPORT PNG
     * ==========================================================
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