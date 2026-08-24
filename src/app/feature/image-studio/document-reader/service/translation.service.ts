import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

export interface TranslationLanguage {
  code: string;       // used as key in LANGUAGE_MODELS below
  label: string;       // shown in the UI
  modelId: string;     // Xenova model repo id
}

// =========================================================
// SUPPORTED LANGUAGES
// =========================================================
// Only add a language here after confirming the model actually
// exists at https://huggingface.co/Xenova/<modelId> — not every
// Helsinki-NLP opus-mt pair has been converted to the ONNX format
// Transformers.js needs. Loading an unlisted/nonexistent model
// will throw a clear error rather than silently failing.
export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  // --- Indian language ---
  { code: 'hi', label: 'Hindi', modelId: 'Xenova/opus-mt-en-hi' },

  // --- Foreign languages ---
  { code: 'fr', label: 'French', modelId: 'Xenova/opus-mt-en-fr' },
  { code: 'es', label: 'Spanish', modelId: 'Xenova/opus-mt-en-es' },
  { code: 'ar', label: 'Arabic', modelId: 'Xenova/opus-mt-en-ar' },
  { code: 'zh', label: 'Chinese', modelId: 'Xenova/opus-mt-en-zh' },
  { code: 'ru', label: 'Russian', modelId: 'Xenova/opus-mt-en-ru' },
  { code: 'it', label: 'Italian', modelId: 'Xenova/opus-mt-en-it' },
  { code: 'vi', label: 'Vietnamese', modelId: 'Xenova/opus-mt-en-vi' },
  { code: 'id', label: 'Indonesian', modelId: 'Xenova/opus-mt-en-id' },
  { code: 'hu', label: 'Hungarian', modelId: 'Xenova/opus-mt-en-hu' },
];

interface LoadedTranslator {
  translator: any;
  device: 'webgpu' | 'wasm';
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  // One loaded translator per target-language code, so switching
  // languages doesn't reload a model you've already loaded.
  private translators = new Map<string, LoadedTranslator>();
  private loadingPromises = new Map<string, Promise<LoadedTranslator>>();

  // Translation cache keyed by `${langCode}::${sourceLine}`
  private translationCache = new Map<string, string>();


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
  // LANGUAGE HELPERS
  // =========================================================

  getSupportedLanguages(): TranslationLanguage[] {
    return TRANSLATION_LANGUAGES;
  }

  private getLanguageConfig(code: string): TranslationLanguage {
    const lang = TRANSLATION_LANGUAGES.find(l => l.code === code);

    if (!lang) {
      throw new Error(
        `Unsupported translation language "${code}". ` +
        `Add it to TRANSLATION_LANGUAGES in translation.service.ts ` +
        `after confirming the model exists on Hugging Face.`
      );
    }

    return lang;
  }


  // =========================================================
  // LOAD TRANSLATION MODEL (per target language)
  // =========================================================

  async loadModel(targetLangCode: string): Promise<LoadedTranslator> {

    const cached = this.translators.get(targetLangCode);
    if (cached) {
      return cached;
    }

    const inFlight = this.loadingPromises.get(targetLangCode);
    if (inFlight) {
      return inFlight;
    }

    const promise = this.loadModelForLanguage(targetLangCode);
    this.loadingPromises.set(targetLangCode, promise);

    try {
      const result = await promise;
      this.translators.set(targetLangCode, result);
      return result;
    } finally {
      this.loadingPromises.delete(targetLangCode);
    }
  }

  private async loadModelForLanguage(targetLangCode: string): Promise<LoadedTranslator> {

    const { modelId, label } = this.getLanguageConfig(targetLangCode);

    // =========================================================
    // TRY WEBGPU
    // =========================================================

    if (this.isWebGPUSupported()) {

      try {

        console.log(`Trying ${label} translation model with WebGPU...`);

        const translator = await pipeline('translation', modelId, {
          device: 'webgpu',
          dtype: 'q8'
        });

        console.log(`${label} translation model loaded using WebGPU.`);

        return { translator, device: 'webgpu' };

      } catch (error) {

        console.warn(
          `WebGPU translation failed for ${label}. Falling back to WASM.`,
          error
        );

      }

    }


    // =========================================================
    // WASM FALLBACK
    // =========================================================

    try {

      console.log(`Trying ${label} translation model with WASM...`);

      const translator = await pipeline('translation', modelId, {
        device: 'wasm',
        dtype: 'q8'
      });

      console.log(`${label} translation model loaded using WASM.`);

      return { translator, device: 'wasm' };

    } catch (error) {

      console.error(`${label} translation model loading failed.`, error);

      throw new Error(
        `Could not load the ${label} translation model. ` +
        `The model "${modelId}" may not exist or may not be ` +
        `compatible with this version of Transformers.js.`
      );

    }

  }


  // =========================================================
  // TRANSLATE
  // =========================================================

  async translate(text: string, targetLangCode: string): Promise<string> {

    if (!text || !text.trim()) {
      throw new Error('No text provided for translation.');
    }

    const { translator, device } = await this.loadModel(targetLangCode);

    console.log(`Translating to "${targetLangCode}" using ${device}...`);

    const lines = text.split('\n');

    const translatedLines: string[] = new Array(lines.length);

    const toTranslateIndices: number[] = [];
    const toTranslateText: string[] = [];

    lines.forEach((line, i) => {

      const trimmed = line.trim();

      // Preserve blank lines and page separators as-is
      if (!trimmed || trimmed.startsWith('--- Page')) {
        translatedLines[i] = line;
        return;
      }

      const cacheKey = `${targetLangCode}::${trimmed}`;
      const cached = this.translationCache.get(cacheKey);

      if (cached) {
        translatedLines[i] = cached;
        return;
      }

      toTranslateIndices.push(i);
      toTranslateText.push(trimmed);

    });

    const batchSize = device === 'webgpu' ? 16 : 8;

    for (let start = 0; start < toTranslateText.length; start += batchSize) {

      const batch = toTranslateText.slice(start, start + batchSize);

      let results: any;

      try {

        results = await translator(batch, {
          max_new_tokens: 512
        });

      } catch (error) {

        console.warn(
          'Batch translation failed, keeping original text for this batch.',
          error
        );

        batch.forEach((original, j) => {
          const idx = toTranslateIndices[start + j];
          translatedLines[idx] = original;
        });

        continue;

      }

      const resultArray = Array.isArray(results) ? results : [results];

      resultArray.forEach((result: any, j: number) => {

        const idx = toTranslateIndices[start + j];
        const original = toTranslateText[start + j];

        const translatedText = result?.translation_text?.trim();
        const finalText = translatedText || original;

        translatedLines[idx] = finalText;
        this.translationCache.set(`${targetLangCode}::${original}`, finalText);

      });

    }

    const fullTranslation = translatedLines.join('\n').trim();

    if (!fullTranslation) {
      throw new Error('Translation returned empty text.');
    }

    return fullTranslation;

  }


  // =========================================================
  // UTILITIES
  // =========================================================

  isModelLoaded(targetLangCode: string): boolean {
    return this.translators.has(targetLangCode);
  }

  clearTranslationCache(): void {
    this.translationCache.clear();
  }

}