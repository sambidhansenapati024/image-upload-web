import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OcrService } from './service/ocr.service';
import { TranslationService } from './service/translation.service';
import { SummarizationService } from './service/summarization.service';
import { TextToSpeechService } from './service/text-to-speech.service.service';
import { SpeechToTextService } from './service/speech-to-text.service';

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

  // =========================================================
  // FILE / OCR
  // =========================================================

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


  // =========================================================
  // LANGUAGES
  // =========================================================

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


  // =========================================================
  // TRANSLATION
  // =========================================================

  translationText = '';

  loadingTranslation = false;

  translationError = '';


  // =========================================================
  // SUMMARY
  // =========================================================

  summaryText = '';

  loadingSummary = false;

  summaryModelReady = false;

  summaryError = '';


  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  speechTarget: SpeechTarget = null;

  speechSpeaking = false;

  speechPaused = false;

  speechError = '';

  speechLanguage = 'en-US';

  // =========================================================
// SPEECH TO TEXT
// =========================================================

speechText = '';

speechListening = false;

speechSupported = false;


  constructor(
    private ocrService: OcrService,
    private translationService: TranslationService,
    private summarizationService: SummarizationService,
    private textToSpeechService: TextToSpeechService,
     private speechToTextService: SpeechToTextService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  async ngOnInit(): Promise<void> {

    this.speechSupported =
  this.speechToTextService.isSupported();

    try {

      console.log('Loading OCR model...');

      await this.ocrService.loadModel(
        this.selectedLanguages
      );

      this.modelReady = true;

      console.log('OCR model ready.');

    } catch (error) {

      console.error(
        'OCR model loading failed:',
        error
      );

      this.errorMessage =
        'Unable to load the OCR model. Please refresh and try again.';

    } finally {

      this.loadingModel = false;

    }

  }

  // =========================================================
// START SPEECH RECOGNITION
// =========================================================

startSpeechRecognition(): void {

  if (!this.speechSupported) {

    this.speechError =
      'Speech recognition is not supported in this browser.';

    return;

  }

  if (this.speechListening) {
    return;
  }

  this.speechError = '';

  this.speechToTextService.start(

    // TEXT RESULT
    (text: string) => {

      this.speechText = text;

    },

    // STATE CHANGE
    (listening: boolean) => {

      this.speechListening =
        listening;

    },

    // ERROR
    (error: any) => {

      console.error(
        'Speech recognition error:',
        error
      );

      this.speechListening =
        false;

      this.speechError =
        'Unable to recognize your speech. Please try again.';

    }

  );

}


// =========================================================
// STOP SPEECH RECOGNITION
// =========================================================

stopSpeechRecognition(): void {

  this.speechToTextService.stop();

  this.speechListening =
    false;

}


  // =========================================================
  // FILE SELECT
  // =========================================================

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file =
      input.files[0];

    this.errorMessage = '';

    this.extractedText = '';

    this.translationText = '';

    this.summaryText = '';

    this.pageTexts = [];

    this.currentPage = 0;

    this.totalPages = 0;

    this.stopSpeech();


    const isImage =
      file.type.startsWith('image/');

    const isPdf =
      file.type === 'application/pdf';


    if (!isImage && !isPdf) {

      this.errorMessage =
        'Please select a valid image or PDF file.';

      return;

    }


    this.selectedFile = file;

    this.isPdf = isPdf;


    if (this.imagePreview) {

      URL.revokeObjectURL(
        this.imagePreview
      );

    }


    this.imagePreview =
      isImage
        ? URL.createObjectURL(file)
        : null;

  }


  // =========================================================
  // LANGUAGE
  // =========================================================

  toggleLanguage(code: string): void {

    const index =
      this.selectedLanguages.indexOf(code);


    if (index === -1) {

      this.selectedLanguages = [
        ...this.selectedLanguages,
        code
      ];

    } else {

      if (
        this.selectedLanguages.length === 1
      ) {
        return;
      }

      this.selectedLanguages =
        this.selectedLanguages.filter(
          c => c !== code
        );

    }


    this.onLanguageChange();

  }


  isLanguageSelected(code: string): boolean {

    return this.selectedLanguages.includes(code);

  }


  async onLanguageChange(): Promise<void> {

    if (
      this.selectedLanguages.length === 0
    ) {

      this.selectedLanguages =
        ['eng'];

    }


    this.loadingModel = true;

    this.modelReady = false;

    this.errorMessage = '';


    try {

      await this.ocrService.loadModel(
        this.selectedLanguages
      );

      this.modelReady = true;

    } catch (error) {

      console.error(
        'Failed to switch OCR languages:',
        error
      );

      this.errorMessage =
        'Unable to switch languages. Please try again.';

    } finally {

      this.loadingModel = false;

    }

  }


  // =========================================================
  // OCR
  // =========================================================

  async extractText(): Promise<void> {

    if (!this.selectedFile) {

      this.errorMessage =
        'Please select a file first.';

      return;

    }


    if (!this.modelReady) {

      this.errorMessage =
        'OCR model is not ready yet.';

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

    this.stopSpeech();


    try {

      console.log('Starting OCR...');


      const result =
        await this.ocrService.extractText(
          this.selectedFile,
          this.selectedLanguages,
          (page, total) => {

            this.currentPage = page;

            this.totalPages = total;

          }
        );


      this.extractedText =
        result.fullText;

      this.pageTexts =
        result.pages;


      console.log(
        'Extracted text:',
        result
      );


    } catch (error) {

      console.error(
        'OCR failed:',
        error
      );

      this.errorMessage =
        'Unable to extract text from this file.';

    } finally {

      this.processing = false;

    }

  }


  // =========================================================
  // TRANSLATION
  // =========================================================

  async translateText(): Promise<void> {

    if (!this.extractedText.trim()) {

      this.translationError =
        'Please extract text first.';

      return;

    }


    if (this.loadingTranslation) {
      return;
    }


    this.loadingTranslation = true;

    this.translationError = '';

    this.translationText = '';


    try {

      console.log(
        'Starting translation...'
      );


      this.translationText =
        await this.translationService.translate(
          this.extractedText
        );


      console.log(
        'Translation completed:',
        this.translationText
      );


    } catch (error) {

      console.error(
        'Translation failed:',
        error
      );


      this.translationError =
        'Unable to translate the text. Please try again.';

    } finally {

      this.loadingTranslation = false;

    }

  }


  // =========================================================
  // SUMMARY
  // =========================================================

  async summarizeText(): Promise<void> {

    if (!this.extractedText.trim()) {

      this.summaryError =
        'Please extract some text first.';

      return;

    }


    if (this.loadingSummary) {
      return;
    }


    this.loadingSummary = true;

    this.summaryError = '';

    this.summaryText = '';


    try {

      console.log(
        'Starting summarization...'
      );


      this.summaryText =
        await this.summarizationService.summarizeText(
          this.extractedText
        );


      this.summaryModelReady = true;


      console.log(
        'Summary:',
        this.summaryText
      );


    } catch (error) {

      console.error(
        'Summarization failed:',
        error
      );


      this.summaryError =
        'Unable to summarize the text.';

    } finally {

      this.loadingSummary = false;

    }

  }


  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  speakText(
    target: SpeechTarget,
    text: string,
    language: string = 'en-US'
  ): void {

    if (!text?.trim()) {
      return;
    }


    if (!this.textToSpeechService.isSupported()) {

      this.speechError =
        'Text-to-speech is not supported in this browser.';

      return;

    }


    // If another speech is currently active,
    // stop it first.

    this.textToSpeechService.stop();


    this.speechTarget = target;

    this.speechLanguage = language;

    this.speechError = '';

    this.speechPaused = false;

    this.speechSpeaking = true;


    try {

      this.textToSpeechService.speak(
        text,
        language
      );

    } catch (error) {

      console.error(
        'Speech failed:',
        error
      );

      this.speechSpeaking = false;

      this.speechPaused = false;

      this.speechTarget = null;

      this.speechError =
        'Unable to start text-to-speech.';

    }

  }


  // =========================================================
  // PAUSE / RESUME
  // =========================================================

  toggleSpeech(): void {

    if (!this.speechSpeaking) {
      return;
    }


    if (this.speechPaused) {

      // RESUME

      this.textToSpeechService.resume();

      this.speechPaused = false;

      this.speechSpeaking = true;

    } else {

      // PAUSE

      this.textToSpeechService.pause();

      this.speechPaused = true;

      this.speechSpeaking = true;

    }

  }


  // =========================================================
  // STOP
  // =========================================================

  stopSpeech(): void {

    this.textToSpeechService.stop();

    this.speechSpeaking = false;

    this.speechPaused = false;

    this.speechTarget = null;

  }


  // =========================================================
  // CHECK CURRENT SPEECH
  // =========================================================

  isSpeechActive(
    target: SpeechTarget
  ): boolean {

    return (
      this.speechSpeaking &&
      this.speechTarget === target
    );

  }


  // =========================================================
  // RESET
  // =========================================================

  reset(): void {

    this.stopSpeech();


    if (this.imagePreview) {

      URL.revokeObjectURL(
        this.imagePreview
      );

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

    this.currentPage = 0;

    this.totalPages = 0;

  }


  ngOnDestroy(): void {

    this.stopSpeech();

  }

}