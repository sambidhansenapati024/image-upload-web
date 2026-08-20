import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private translator: any = null;

  private loadingPromise: Promise<any> | null = null;

  private device: 'webgpu' | 'wasm' = 'wasm';


  // =========================================================
  // CHECK WEBGPU
  // =========================================================

  private isWebGPUSupported(): boolean {

    return (
      typeof navigator !== 'undefined' &&
      'gpu' in navigator
    );

  }


  // =========================================================
  // LOAD TRANSLATION MODEL
  // =========================================================

  async loadModel(): Promise<any> {

    if (this.translator) {
      return this.translator;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }


    // =========================================================
    // TRY WEBGPU
    // =========================================================

    if (this.isWebGPUSupported()) {

      try {

        console.log(
          'Trying translation model with WebGPU...'
        );

        this.device = 'webgpu';

        this.loadingPromise = pipeline(
          'translation',
          'Xenova/opus-mt-en-hi',
          {
            device: 'webgpu'
          }
        );

        this.translator =
          await this.loadingPromise;

        console.log(
          'Translation model loaded using WebGPU.'
        );

        return this.translator;

      } catch (error) {

        console.warn(
          'WebGPU translation failed. Falling back to WASM.',
          error
        );

        this.translator = null;
        this.loadingPromise = null;

      }

    }


    // =========================================================
    // WASM FALLBACK
    // =========================================================

    try {

      console.log(
        'Trying translation model with WASM...'
      );

      this.device = 'wasm';

      this.loadingPromise = pipeline(
        'translation',
        'Xenova/opus-mt-en-hi',
        {
          device: 'wasm'
        }
      );

      this.translator =
        await this.loadingPromise;

      console.log(
        'Translation model loaded using WASM.'
      );

      return this.translator;

    } catch (error) {

      console.error(
        'Translation model loading failed.',
        error
      );

      this.translator = null;
      this.loadingPromise = null;

      throw error;

    }

  }


  // =========================================================
// TRANSLATE
// =========================================================

async translate(text: string): Promise<string> {

  if (!text || !text.trim()) {
    throw new Error('No text provided for translation.');
  }

  const translator = await this.loadModel();

  console.log(`Translating using ${this.device}...`);

  // Split into lines, keep track of blank lines so we can rejoin
  // the document with its original structure intact.
  const lines = text.split('\n');

  const translatedLines: string[] = [];

  for (const line of lines) {

    const trimmed = line.trim();

    // Preserve blank lines and page separators as-is — nothing to translate
    if (!trimmed || trimmed.startsWith('--- Page')) {
      translatedLines.push(line);
      continue;
    }

    const result = await translator(trimmed, {
      max_new_tokens: 512
    });

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn('No translation for line, keeping original:', trimmed);
      translatedLines.push(trimmed);
      continue;
    }

    const translatedText = result[0]?.translation_text?.trim();
    translatedLines.push(translatedText || trimmed);
  }

  const fullTranslation = translatedLines.join('\n').trim();

  if (!fullTranslation) {
    throw new Error('Translation returned empty text.');
  }

  return fullTranslation;
}

}