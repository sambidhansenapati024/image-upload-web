import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OcrService } from './service/ocr.service';
import { TranslationService, TranslationLanguage } from './service/translation.service';
import { SummarizationService } from './service/summarization.service';
import { TextToSpeechService } from './service/text-to-speech.service.service';
import { SpeechToTextService } from './service/speech-to-text.service';
import { TextToSpeechDownloadService } from './service/text-to-speech-download.service';

interface LanguageOption {
  code: string;
  label: string;
}

type SpeechTarget = 'extracted' | 'translation' | 'summary' | null;

@Component({
  selector: 'app-document-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-reader.component.html',
  styleUrl: './document-reader.component.css'
})
export class DocumentReaderComponent implements OnInit, OnDestroy {

  // File / OCR
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isPdf = false;

  extractedText = '';
  pageTexts: { page: number; text: string }[] = [];

  loadingModel = true;
  modelReady = false;
  processing = false;
  errorMessage = '';

  currentPage = 0;
  totalPages = 0;

  // Languages (OCR)
  availableLanguages: LanguageOption[] = [
    { code: 'eng', label: 'English' },
    { code: 'fra', label: 'French' },
    { code: 'deu', label: 'German' },
    { code: 'spa', label: 'Spanish' },
    { code: 'ita', label: 'Italian' },
    { code: 'por', label: 'Portuguese' },
    { code: 'chi_sim', label: 'Chinese (Simplified)' },
    { code: 'chi_tra', label: 'Chinese (Traditional)' },
    { code: 'jpn', label: 'Japanese' },
    { code: 'kor', label: 'Korean' },
    { code: 'ara', label: 'Arabic' },
    { code: 'hin', label: 'Hindi' },
    { code: 'rus', label: 'Russian' }
  ];

  selectedLanguages: string[] = ['eng'];

  // Translation
  translationLanguages: TranslationLanguage[] = [];
  translationTargetCode = 'hi';
  translationText = '';
  loadingTranslation = false;
  translationError = '';

  // Maps a translation language code to a speechSynthesis locale
  // for "Read aloud" / voice download. Extend when adding a new
  // language above, if you want spoken playback for it too.
  private readonly speechLocales: Record<string, string> = {
    hi: 'hi-IN',
    fr: 'fr-FR',
    es: 'es-ES',
    ar: 'ar-SA',
    zh: 'zh-CN',
    ru: 'ru-RU',
    it: 'it-IT',
    vi: 'vi-VN',
    id: 'id-ID',
    hu: 'hu-HU',
  };

  // Summary
  summaryText = '';
  loadingSummary = false;
  summaryModelReady = false;
  summaryError = '';

  // Text to speech
  speechTarget: SpeechTarget = null;
  speechSpeaking = false;
  speechPaused = false;
  speechError = '';
  speechLanguage = 'en-US';

  // Browser-side downloadable TTS
  downloadingVoiceTarget: SpeechTarget = null;
  downloadingVoice = false;
  voiceDownloadError = '';

  // Speech to text
  speechText = '';
  speechListening = false;
  speechSupported = false;

  constructor(
    private ocrService: OcrService,
    private translationService: TranslationService,
    private summarizationService: SummarizationService,
    private textToSpeechService: TextToSpeechService,
    private speechToTextService: SpeechToTextService,
    private textToSpeechDownloadService: TextToSpeechDownloadService
  ) {}

  async ngOnInit(): Promise<void> {
    this.speechSupported = this.speechToTextService.isSupported();
    this.translationLanguages = this.translationService.getSupportedLanguages();

    try {
      await this.ocrService.loadModel(this.selectedLanguages);
      this.modelReady = true;
    } catch (error) {
      console.error('OCR model loading failed:', error);
      this.errorMessage = 'Unable to load the OCR model. Please refresh and try again.';
    } finally {
      this.loadingModel = false;
    }
  }

  // =========================================================
  // TRANSLATION LANGUAGE SELECTION
  // =========================================================

  get translationTargetLabel(): string {
    return this.translationLanguages.find(
      l => l.code === this.translationTargetCode
    )?.label ?? this.translationTargetCode;
  }

  get translationSpeechLocale(): string {
    return this.speechLocales[this.translationTargetCode] ?? 'en-US';
  }

  setTranslationTarget(code: string): void {
    if (this.translationTargetCode === code) {
      return;
    }

    this.translationTargetCode = code;

    // Clear any previous result — it was translated to the old language
    this.translationText = '';
    this.translationError = '';

    if (this.isSpeechActive('translation')) {
      this.stopSpeech();
    }
  }

  // =========================================================
  // SPEECH TO TEXT
  // =========================================================

  startSpeechRecognition(): void {
    if (!this.speechSupported) {
      this.speechError = 'Speech recognition is not supported in this browser.';
      return;
    }

    if (this.speechListening) {
      return;
    }

    this.speechError = '';
    this.voiceDownloadError = '';

    this.speechToTextService.start(
      (text: string) => {
        this.speechText = text;
      },
      (listening: boolean) => {
        this.speechListening = listening;
      },
      (error: any) => {
        console.error('Speech recognition error:', error);
        this.speechListening = false;
        this.speechError = 'Unable to recognize your speech. Please try again.';
      }
    );
  }

  stopSpeechRecognition(): void {
    this.speechToTextService.stop();
    this.speechListening = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.errorMessage = '';
    this.translationError = '';
    this.summaryError = '';
    this.extractedText = '';
    this.translationText = '';
    this.summaryText = '';
    this.pageTexts = [];
    this.currentPage = 0;
    this.totalPages = 0;
    this.stopSpeech();

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      this.errorMessage = 'Please select a valid image or PDF file.';
      return;
    }

    this.selectedFile = file;
    this.isPdf = isPdf;

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.imagePreview = isImage ? URL.createObjectURL(file) : null;
  }

  toggleLanguage(code: string): void {
    const index = this.selectedLanguages.indexOf(code);

    if (index === -1) {
      this.selectedLanguages = [...this.selectedLanguages, code];
    } else {
      if (this.selectedLanguages.length === 1) {
        return;
      }

      this.selectedLanguages = this.selectedLanguages.filter(c => c !== code);
    }

    this.onLanguageChange();
  }

  isLanguageSelected(code: string): boolean {
    return this.selectedLanguages.includes(code);
  }

  async onLanguageChange(): Promise<void> {
    if (this.selectedLanguages.length === 0) {
      this.selectedLanguages = ['eng'];
    }

    this.loadingModel = true;
    this.modelReady = false;
    this.errorMessage = '';

    try {
      await this.ocrService.loadModel(this.selectedLanguages);
      this.modelReady = true;
    } catch (error) {
      console.error('Failed to switch OCR languages:', error);
      this.errorMessage = 'Unable to switch languages. Please try again.';
    } finally {
      this.loadingModel = false;
    }
  }

  async extractText(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    if (!this.modelReady) {
      this.errorMessage = 'OCR model is not ready yet.';
      return;
    }

    if (this.processing) {
      return;
    }

    this.processing = true;
    this.errorMessage = '';
    this.extractedText = '';
    this.translationText = '';
    this.summaryText = '';
    this.translationError = '';
    this.summaryError = '';
    this.stopSpeech();

    try {
      const result = await this.ocrService.extractText(
        this.selectedFile,
        this.selectedLanguages,
        (page, total) => {
          this.currentPage = page;
          this.totalPages = total;
        }
      );

      this.extractedText = result.fullText;
      this.pageTexts = result.pages;
    } catch (error) {
      console.error('OCR failed:', error);
      this.errorMessage = 'Unable to extract text from this file.';
    } finally {
      this.processing = false;
    }
  }

  async translateText(): Promise<void> {
    if (!this.extractedText.trim()) {
      this.translationError = 'Please extract text first.';
      return;
    }

    if (this.loadingTranslation) {
      return;
    }

    this.loadingTranslation = true;
    this.translationError = '';
    this.translationText = '';

    try {
      this.translationText = await this.translationService.translate(
        this.extractedText,
        this.translationTargetCode
      );
    } catch (error) {
      console.error('Translation failed:', error);
      this.translationError =
        error instanceof Error
          ? error.message
          : 'Unable to translate the text. Please try again.';
    } finally {
      this.loadingTranslation = false;
    }
  }

  async summarizeText(): Promise<void> {
    if (!this.extractedText.trim()) {
      this.summaryError = 'Please extract some text first.';
      return;
    }

    if (this.loadingSummary) {
      return;
    }

    this.loadingSummary = true;
    this.summaryError = '';
    this.summaryText = '';

    try {
      this.summaryText = await this.summarizationService.summarizeText(this.extractedText);
      this.summaryModelReady = true;
    } catch (error) {
      console.error('Summarization failed:', error);
      this.summaryError = 'Unable to summarize the text.';
    } finally {
      this.loadingSummary = false;
    }
  }

  speakText(
    target: SpeechTarget,
    text: string,
    language: string = 'en-US'
  ): void {
    if (!text?.trim()) {
      return;
    }

    if (!this.textToSpeechService.isSupported()) {
      this.speechError = 'Text-to-speech is not supported in this browser.';
      return;
    }

    this.textToSpeechService.stop();

    this.speechTarget = target;
    this.speechLanguage = language;
    this.speechError = '';
    this.speechPaused = false;
    this.speechSpeaking = true;

    try {
      this.textToSpeechService.speak(text, language);
    } catch (error) {
      console.error('Speech failed:', error);
      this.speechSpeaking = false;
      this.speechPaused = false;
      this.speechTarget = null;
      this.speechError = 'Unable to start text-to-speech.';
    }
  }

  async downloadVoice(
    target: SpeechTarget,
    text: string,
    language: string = 'en-US'
  ): Promise<void> {
    if (!text?.trim() || this.downloadingVoice) {
      return;
    }

    this.downloadingVoice = true;
    this.downloadingVoiceTarget = target;
    this.voiceDownloadError = '';
    this.stopSpeech();

    try {
      const blob = await this.textToSpeechDownloadService.generateWav(
        text,
        language
      );

      const safeTarget = target === 'translation'
        ? `${this.translationTargetCode}-translation`
        : target === 'summary'
          ? 'summary'
          : 'extracted-text';

      const fileName = `${safeTarget}-${Date.now()}.wav`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = fileName;
      anchor.style.display = 'none';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Voice download failed:', error);
      this.voiceDownloadError =
        'Unable to generate the voice file. Please try again.';
    } finally {
      this.downloadingVoice = false;
      this.downloadingVoiceTarget = null;
    }
  }

  isDownloadingVoice(target: SpeechTarget): boolean {
    return this.downloadingVoice && this.downloadingVoiceTarget === target;
  }

  toggleSpeech(): void {
    if (!this.speechSpeaking) {
      return;
    }

    if (this.speechPaused) {
      this.textToSpeechService.resume();
      this.speechPaused = false;
      this.speechSpeaking = true;
    } else {
      this.textToSpeechService.pause();
      this.speechPaused = true;
      this.speechSpeaking = true;
    }
  }

  stopSpeech(): void {
    this.textToSpeechService.stop();
    this.speechSpeaking = false;
    this.speechPaused = false;
    this.speechTarget = null;
  }

  isSpeechActive(target: SpeechTarget): boolean {
    return this.speechSpeaking && this.speechTarget === target;
  }

  reset(): void {
    this.stopSpeech();

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.selectedFile = null;
    this.imagePreview = null;
    this.isPdf = false;
    this.extractedText = '';
    this.translationText = '';
    this.summaryText = '';
    this.pageTexts = [];
    this.errorMessage = '';
    this.translationError = '';
    this.summaryError = '';
    this.speechError = '';
    this.currentPage = 0;
    this.totalPages = 0;
    this.speechText = '';
    this.summaryModelReady = false;
  }

  ngOnDestroy(): void {
    this.stopSpeech();

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }
}