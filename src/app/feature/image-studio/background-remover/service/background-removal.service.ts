import { Injectable } from '@angular/core';
import {
  AutoModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor,
  env,
} from '@huggingface/transformers';

// Don't check for local models — always pull from the HF hub
env.allowLocalModels = false;
// Avoids freezing the UI thread on WASM
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = true;
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundRemovalService {

  private model: PreTrainedModel | null = null;
  private processor: Processor | null = null;
  private loadingPromise: Promise<{ model: PreTrainedModel; processor: Processor }> | null = null;
  private device: 'webgpu' | 'wasm' = 'wasm';

  private isWebGPUSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  async loadModel(): Promise<{ model: PreTrainedModel; processor: Processor }> {
    if (this.model && this.processor) {
      return { model: this.model, processor: this.processor };
    }
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    const tryLoad = async (device: 'webgpu' | 'wasm') => {
      console.log(`Loading RMBG-1.4 with ${device}...`);

      const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        // RMBG-1.4's config.json can't be auto-mapped to a pipeline task,
        // so we tell transformers.js to treat it as custom code instead.
        config: { model_type: 'custom' } as any,
        device,
      });

      const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          image_std: [1, 1, 1],
          feature_extractor_type: 'ImageFeatureExtractor',
          resample: 2,
          rescale_factor: 1 / 255,
          size: { width: 1024, height: 1024 },
        } as any,
      });

      this.device = device;
      return { model, processor };
    };

    this.loadingPromise = (async () => {
      if (this.isWebGPUSupported()) {
        try {
          const result = await tryLoad('webgpu');
          this.model = result.model;
          this.processor = result.processor;
          console.log('RMBG-1.4 loaded using WebGPU.');
          return result;
        } catch (err) {
          console.warn('WebGPU failed, falling back to WASM.', err);
        }
      }

      const result = await tryLoad('wasm');
      this.model = result.model;
      this.processor = result.processor;
      console.log('RMBG-1.4 loaded using WASM.');
      return result;
    })();

    try {
      return await this.loadingPromise;
    } catch (err) {
      this.loadingPromise = null;
      this.model = null;
      this.processor = null;
      throw err;
    }
  }

  async removeBackground(file: File): Promise<Blob> {
    const { model, processor } = await this.loadModel();

    console.log(`Removing background using ${this.device}...`);

    const url = URL.createObjectURL(file);
    let image: RawImage;
    try {
      image = await RawImage.fromURL(url);
    } finally {
      URL.revokeObjectURL(url);
    }

    // Pre-process image
    const { pixel_values } = await processor(image);

    // Predict alpha matte
    const { output } = await model({ input: pixel_values });

    // output[0] is a [1, H, W] tensor in [0,1] — scale to 0-255 and
    // resize back up to the original image's dimensions
    const maskTensor = output[0].mul(255).to('uint8');
    const mask = await RawImage.fromTensor(maskTensor).resize(image.width, image.height);

    // Composite: draw the original image, then overwrite its alpha
    // channel with the predicted mask
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context.');
    }

    ctx.drawImage(image.toCanvas(), 0, 0);

    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
      pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob from canvas.'));
        }
      }, 'image/png');
    });
  }
}