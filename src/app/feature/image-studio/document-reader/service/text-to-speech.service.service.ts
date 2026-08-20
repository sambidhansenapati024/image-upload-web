import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private synth: SpeechSynthesis | null = null;

  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private paused = false;
  private speaking = false;


  constructor() {

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {

      this.synth = window.speechSynthesis;

    }

  }


  // =========================================================
  // CHECK SUPPORT
  // =========================================================

  isSupported(): boolean {

    return this.synth !== null;

  }


  // =========================================================
  // SPEAK
  // =========================================================

  speak(
    text: string,
    language: string = 'en-US'
  ): void {

    if (!this.synth) {

      throw new Error(
        'Text-to-speech is not supported in this browser.'
      );

    }


    if (!text?.trim()) {
      return;
    }


    // Stop previous speech

    this.synth.cancel();


    this.paused = false;
    this.speaking = false;


    const utterance =
      new SpeechSynthesisUtterance(text);


    utterance.lang =
      language;

    utterance.rate =
      1;

    utterance.pitch =
      1;

    utterance.volume =
      1;


    this.currentUtterance =
      utterance;


    utterance.onstart = () => {

      console.log('Speech started');

      this.speaking = true;
      this.paused = false;

    };


    utterance.onpause = () => {

      console.log('Speech paused');

      this.speaking = true;
      this.paused = true;

    };


    utterance.onresume = () => {

      console.log('Speech resumed');

      this.speaking = true;
      this.paused = false;

    };


    utterance.onend = () => {

      console.log('Speech ended');

      this.speaking = false;
      this.paused = false;

      this.currentUtterance = null;

    };


    utterance.onerror = (event) => {

      console.error(
        'Speech synthesis error:',
        event
      );

      this.speaking = false;
      this.paused = false;

      this.currentUtterance = null;

    };


    this.synth.speak(
      utterance
    );

  }


  // =========================================================
  // PAUSE
  // =========================================================

  pause(): void {

    if (!this.synth) {
      return;
    }


    if (this.speaking && !this.paused) {

      console.log('Pausing speech...');

      this.synth.pause();

      this.paused = true;

    }

  }


  // =========================================================
  // RESUME
  // =========================================================

  resume(): void {

    if (!this.synth) {
      return;
    }


    if (this.paused) {

      console.log('Resuming speech...');

      this.synth.resume();

      this.paused = false;

    }

  }


  // =========================================================
  // STOP
  // =========================================================

  stop(): void {

    if (!this.synth) {
      return;
    }


    console.log('Stopping speech...');

    this.synth.cancel();

    this.speaking = false;
    this.paused = false;

    this.currentUtterance = null;

  }


  // =========================================================
  // STATUS
  // =========================================================

  isSpeaking(): boolean {

    return this.speaking;

  }


  isPaused(): boolean {

    return this.paused;

  }

}