import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechToTextService {

  private recognition: any = null;

  private listening = false;

  private shouldContinue = false;

  private finalText = '';

  constructor() {

    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {

      console.warn(
        'Speech Recognition is not supported in this browser.'
      );

      return;
    }

    this.recognition =
      new SpeechRecognition();

    /*
     * Keep recognition active while the user is speaking.
     */
    this.recognition.continuous = true;

    /*
     * Give us both final and temporary results.
     */
    this.recognition.interimResults = true;

    /*
     * Default language.
     */
    this.recognition.lang = 'en-US';
  }


  // =========================================================
  // CHECK SUPPORT
  // =========================================================

  isSupported(): boolean {

    return this.recognition !== null;

  }


  // =========================================================
  // START
  // =========================================================

  start(
    onText: (text: string) => void,
    onStateChange?: (listening: boolean) => void,
    onError?: (error: any) => void
  ): void {

    if (!this.recognition) {

      onError?.(
        new Error(
          'Speech recognition is not supported in this browser.'
        )
      );

      return;
    }


    if (this.listening) {
      return;
    }


    this.shouldContinue = true;

    this.finalText = '';


    // =======================================================
    // START EVENT
    // =======================================================

    this.recognition.onstart = () => {

      this.listening = true;

      onStateChange?.(true);

      console.log(
        'Speech recognition started.'
      );

    };


    // =======================================================
    // RESULT EVENT
    // =======================================================

    this.recognition.onresult = (event: any) => {

      let interimText = '';

      let newFinalText = '';


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const transcript =
          event.results[i][0].transcript;


        if (event.results[i].isFinal) {

          newFinalText +=
            transcript + ' ';

        } else {

          interimText +=
            transcript;

        }

      }


      if (newFinalText) {

        this.finalText +=
          newFinalText;

      }


      const completeText =
        (
          this.finalText +
          interimText
        ).trim();


      onText(
        completeText
      );

    };


    // =======================================================
    // ERROR
    // =======================================================

    this.recognition.onerror = (event: any) => {

      console.warn(
        'Speech recognition event:',
        event.error
      );


      /*
       * no-speech is NOT a fatal error.
       *
       * Chrome can generate this when the user
       * hasn't spoken for a while.
       *
       * We don't want to show an error to the user.
       */

      if (event.error === 'no-speech') {

        console.log(
          'No speech detected. Waiting for speech...'
        );

        return;
      }


      /*
       * Ignore aborted sessions as well.
       */

      if (event.error === 'aborted') {

        return;
      }


      /*
       * Real errors.
       */

      this.shouldContinue = false;

      this.listening = false;

      onStateChange?.(false);

      onError?.(event);

    };


    // =======================================================
    // END
    // =======================================================

    this.recognition.onend = () => {

      console.log(
        'Speech recognition ended.'
      );


      /*
       * Chrome may automatically stop recognition.
       *
       * If the user has NOT clicked Stop,
       * start it again.
       */

      if (this.shouldContinue) {

        console.log(
          'Restarting speech recognition...'
        );


        setTimeout(() => {

          if (!this.shouldContinue) {
            return;
          }


          try {

            this.recognition.start();

          } catch (error) {

            console.warn(
              'Unable to restart speech recognition:',
              error
            );

          }

        }, 300);


        return;
      }


      this.listening = false;

      onStateChange?.(false);

    };


    // =======================================================
    // START RECOGNITION
    // =======================================================

    try {

      this.recognition.start();

    } catch (error) {

      console.error(
        'Unable to start speech recognition:',
        error
      );

      this.shouldContinue = false;

      this.listening = false;

      onStateChange?.(false);

      onError?.(error);

    }

  }


  // =========================================================
  // STOP
  // =========================================================

  stop(): void {

    if (!this.recognition) {
      return;
    }


    console.log(
      'Stopping speech recognition...'
    );


    /*
     * This is important.
     *
     * onend checks this flag to decide whether
     * it should restart recognition.
     */

    this.shouldContinue = false;


    try {

      this.recognition.stop();

    } catch (error) {

      console.warn(
        'Speech recognition stop failed:',
        error
      );

    }


    this.listening = false;

  }


  // =========================================================
  // CHECK LISTENING
  // =========================================================

  isListening(): boolean {

    return this.listening;

  }


  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================

  setLanguage(language: string): void {

    if (!this.recognition) {
      return;
    }


    this.recognition.lang =
      language;

  }

}