import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

@Injectable({
  providedIn: 'root'
})
export class SummarizationService {

  private summarizer: any = null;
  private loadingPromise: Promise<any> | null = null;
  private readonly device = 'wasm'; // forced — no WebGPU, no device-death risk

  // =========================================================
  // LOAD MODEL — WASM only
  // =========================================================

  async loadModel(): Promise<any> {

    if (this.summarizer) {
      return this.summarizer;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
  console.log('Loading summarization model using WASM (fp32)...');

  const summarizer = await pipeline(
    'summarization',
    'Xenova/distilbart-cnn-6-6',
    {
      device: 'wasm',
      dtype: 'fp32'   // <-- forces full-precision weights, sidesteps the q8 WASM bug
    }
  );

  this.summarizer = summarizer;
  console.log('Summarization model loaded using WASM (fp32).');
  return summarizer;
})();

    try {
      return await this.loadingPromise;
    } catch (error) {
      console.error('Failed to load summarization model.', error);
      this.summarizer = null;
      this.loadingPromise = null;
      throw error;
    }
  }

  // =========================================================
  // SUMMARIZE — chunks long text
  // =========================================================

  async summarizeText(
    text: string,
    onProgress?: (done: number, total: number) => void
  ): Promise<string> {

    if (!text || !text.trim()) {
      throw new Error('No text available for summarization.');
    }

    // Strip OCR page markers before summarizing — they add noise, not content
    const cleanText = text
      .replace(/--- Page \d+ ---/g, '')
      .replace(/\n{2,}/g, '\n')
      .trim();

    const chunks = this.chunkText(cleanText, 3000); // ~3000 chars ≈ safely under 1024 tokens

    const summaries: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkSummary = await this.runSummarizer(chunks[i]);
      summaries.push(chunkSummary);
      onProgress?.(i + 1, chunks.length);
    }

    // Single chunk — that's already the final summary
    if (summaries.length === 1) {
      return summaries[0];
    }

    // Multiple chunks — summarize the summaries into one coherent result
    const combined = summaries.join(' ');
    return this.runSummarizer(combined);
  }

  private async runSummarizer(text: string): Promise<string> {
    const summarizer = await this.loadModel();

    console.log(`Summarizing using ${this.device}...`);

    const result = await summarizer(text, {
      max_new_tokens: 150,
      min_new_tokens: 30
    });

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Summarization returned no result.');
    }

    const summary = result[0]?.summary_text?.trim();

    if (!summary) {
      throw new Error('No summary could be generated.');
    }

    return summary;
  }

  // =========================================================
  // CHUNK TEXT — split on sentence/paragraph boundaries
  // =========================================================

  private chunkText(text: string, maxChars: number): string[] {

    if (text.length <= maxChars) {
      return [text];
    }

    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > maxChars && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks;
  }
}