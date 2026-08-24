import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';

type TtsOutput = {
  audio: Float32Array;
  sampling_rate: number;
};

type TtsPipeline = (text: string) => Promise<TtsOutput>;

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechDownloadService {

  private readonly models: Record<string, string> = {
    en: 'Xenova/mms-tts-eng',
    hi: 'Xenova/mms-tts-hin',
    fr: 'Xenova/mms-tts-fra',
    de: 'Xenova/mms-tts-deu',
    es: 'Xenova/mms-tts-spa',
    it: 'Xenova/mms-tts-ita',
    pt: 'Xenova/mms-tts-por',
    zh: 'Xenova/mms-tts-cmn',
    ja: 'Xenova/mms-tts-jpn',
    ko: 'Xenova/mms-tts-kor',
    ar: 'Xenova/mms-tts-ara',
    ru: 'Xenova/mms-tts-rus'
  };

  private pipelines = new Map<string, Promise<TtsPipeline>>();

  async generateWav(
    text: string,
    language: string = 'en-US'
  ): Promise<Blob> {

    const cleanText = text?.trim();

    if (!cleanText) {
      throw new Error('No text provided for voice generation.');
    }

    const languageCode = this.getLanguageCode(language);

    const model =
      this.models[languageCode] ??
      this.models['en'];

    const tts = await this.getPipeline(model);

    /*
     * Split large OCR text into smaller chunks.
     */
    const chunks = this.splitText(cleanText, 400);

    const audioChunks: Float32Array[] = [];

    let sampleRate = 16000;

    for (const chunk of chunks) {

      const result = await tts(chunk);

      if (!result?.audio?.length) {
        continue;
      }

      audioChunks.push(result.audio);

      if (result.sampling_rate) {
        sampleRate = result.sampling_rate;
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('No audio was generated.');
    }

    const combinedAudio =
      this.combineAudio(audioChunks);

    return this.createWav(
      combinedAudio,
      sampleRate
    );
  }

  private async getPipeline(
    model: string
  ): Promise<TtsPipeline> {

    let existingPipeline =
      this.pipelines.get(model);

    if (!existingPipeline) {

      existingPipeline =
        pipeline(
          'text-to-speech',
          model,
          {
            dtype: 'q8'
          }
        ) as unknown as Promise<TtsPipeline>;

      this.pipelines.set(
        model,
        existingPipeline
      );
    }

    return existingPipeline;
  }

  private getLanguageCode(
    language: string
  ): string {

    return language
      .toLowerCase()
      .split('-')[0]
      .split('_')[0];
  }

  private splitText(
    text: string,
    maxLength: number
  ): string[] {

    const normalized =
      text
        .replace(/\s+/g, ' ')
        .trim();

    if (normalized.length <= maxLength) {
      return [normalized];
    }

    const sentences =
      normalized.match(
        /[^.!?।]+[.!?।]+|[^.!?।]+$/g
      ) ?? [normalized];

    const chunks: string[] = [];

    let current = '';

    for (const sentence of sentences) {

      const part = sentence.trim();

      if (!part) {
        continue;
      }

      const combined =
        `${current} ${part}`.trim();

      if (combined.length <= maxLength) {

        current = combined;

      } else {

        if (current) {
          chunks.push(current);
        }

        /*
         * If a single sentence is too long,
         * split it by words.
         */
        if (part.length > maxLength) {

          const words = part.split(/\s+/);

          current = '';

          for (const word of words) {

            const next =
              `${current} ${word}`.trim();

            if (next.length <= maxLength) {

              current = next;

            } else {

              if (current) {
                chunks.push(current);
              }

              current = word;
            }
          }

        } else {

          current = part;
        }
      }
    }

    if (current) {
      chunks.push(current);
    }

    return chunks;
  }

  private combineAudio(
    chunks: Float32Array[]
  ): Float32Array {

    const totalLength =
      chunks.reduce(
        (total, chunk) =>
          total + chunk.length,
        0
      );

    const result =
      new Float32Array(totalLength);

    let offset = 0;

    for (const chunk of chunks) {

      result.set(
        chunk,
        offset
      );

      offset += chunk.length;
    }

    return result;
  }

  private createWav(
    audio: Float32Array,
    sampleRate: number
  ): Blob {

    const channels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;

    const dataSize =
      audio.length *
      bytesPerSample;

    const buffer =
      new ArrayBuffer(
        44 + dataSize
      );

    const view =
      new DataView(buffer);

    /*
     * RIFF header
     */
    this.writeString(
      view,
      0,
      'RIFF'
    );

    view.setUint32(
      4,
      36 + dataSize,
      true
    );

    this.writeString(
      view,
      8,
      'WAVE'
    );

    /*
     * fmt chunk
     */
    this.writeString(
      view,
      12,
      'fmt '
    );

    view.setUint32(
      16,
      16,
      true
    );

    // PCM
    view.setUint16(
      20,
      1,
      true
    );

    view.setUint16(
      22,
      channels,
      true
    );

    view.setUint32(
      24,
      sampleRate,
      true
    );

    view.setUint32(
      28,
      sampleRate *
      channels *
      bytesPerSample,
      true
    );

    view.setUint16(
      32,
      channels *
      bytesPerSample,
      true
    );

    view.setUint16(
      34,
      bitsPerSample,
      true
    );

    /*
     * data chunk
     */
    this.writeString(
      view,
      36,
      'data'
    );

    view.setUint32(
      40,
      dataSize,
      true
    );

    /*
     * Float32 → PCM16
     */
    for (
      let i = 0;
      i < audio.length;
      i++
    ) {

      const sample =
        Math.max(
          -1,
          Math.min(
            1,
            audio[i]
          )
        );

      const pcm =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7FFF;

      view.setInt16(
        44 + i * 2,
        pcm,
        true
      );
    }

    return new Blob(
      [buffer],
      {
        type: 'audio/wav'
      }
    );
  }

  private writeString(
    view: DataView,
    offset: number,
    value: string
  ): void {

    for (
      let i = 0;
      i < value.length;
      i++
    ) {

      view.setUint8(
        offset + i,
        value.charCodeAt(i)
      );
    }
  }
}