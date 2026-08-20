import { Injectable } from '@angular/core';
import { createWorker, Lang, Worker as TesseractWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Point pdf.js at its worker bundle (esbuild/Angular-friendly pattern)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface OcrPageResult {
  page: number;
  text: string;
}

export interface OcrResult {
  fullText: string;
  pages: OcrPageResult[];
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  private worker: TesseractWorker | null = null;
  private loadingPromise: Promise<TesseractWorker> | null = null;
  private loadedLangs: string[] = [];

  // =========================================================
  // LOAD / SWITCH LANGUAGES
  // =========================================================

  async loadModel(languages: string[] = ['eng']): Promise<TesseractWorker> {
    const langsChanged =
      this.loadedLangs.length !== languages.length ||
      !languages.every((l) => this.loadedLangs.includes(l));

    if (this.worker && !langsChanged) {
      return this.worker;
    }

    // Different languages requested — reinitialize instead of recreating
    if (this.worker && langsChanged) {
      console.log('Switching OCR languages to', languages);
      await this.worker.reinitialize(languages as unknown as Lang[]);
      this.loadedLangs = languages;
      return this.worker;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      console.log('Loading Tesseract OCR worker for languages:', languages);
      const worker = await createWorker(languages as unknown as Lang[]);
      this.worker = worker;
      this.loadedLangs = languages;
      console.log('Tesseract OCR worker ready.');
      return worker;
    })();

    try {
      return await this.loadingPromise;
    } catch (err) {
      this.loadingPromise = null;
      throw err;
    }
  }

  // =========================================================
  // EXTRACT TEXT — routes to image or PDF handling
  // =========================================================

  async extractText(
    file: File,
    languages: string[] = ['eng'],
    onPageProgress?: (page: number, totalPages: number) => void
  ): Promise<OcrResult> {

    if (file.type === 'application/pdf') {
      return this.extractTextFromPdf(file, languages, onPageProgress);
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Unsupported file type. Please upload an image or PDF.');
    }

    const worker = await this.loadModel(languages);

    console.log('Running OCR on image...');
    const { data } = await worker.recognize(file);

    const text = data.text?.trim();
    if (!text) {
      throw new Error('No text could be detected.');
    }

    return {
      fullText: text,
      pages: [{ page: 1, text }]
    };
  }

  // =========================================================
  // PDF: RENDER EACH PAGE TO A CANVAS, THEN OCR IT
  // =========================================================

  private async extractTextFromPdf(
    file: File,
    languages: string[],
    onPageProgress?: (page: number, totalPages: number) => void
  ): Promise<OcrResult> {

    const worker = await this.loadModel(languages);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: OcrPageResult[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

      onPageProgress?.(pageNum, pdf.numPages);

      const page = await pdf.getPage(pageNum);

      // Scale up for better OCR accuracy on smaller/scanned PDFs
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context for PDF rendering.');
      }

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      console.log(`Running OCR on PDF page ${pageNum}/${pdf.numPages}...`);
      const { data } = await worker.recognize(canvas);

      const pageText = data.text?.trim() ?? '';
      pages.push({ page: pageNum, text: pageText });

      // Free the page's resources before moving on
      page.cleanup();
    }

    const fullText = pages
      .map((p) => `--- Page ${p.page} ---\n${p.text}`)
      .join('\n\n')
      .trim();

    if (!fullText) {
      throw new Error('No text could be detected in this PDF.');
    }

    return { fullText, pages };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.loadingPromise = null;
      this.loadedLangs = [];
    }
  }
}