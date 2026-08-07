import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';

type Phase =
  | 'INPUT'
  | 'SQUARE'
  | 'SCAN'
  | 'PULL'
  | 'MORPH'
  | 'ABSORB'
  | 'GROW'
  | 'LIGHT'
  | 'REVEAL'
  | 'SUCCESS'
  | 'EXIT';

@Component({
  selector: 'app-otp-verification',
  imports: [],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent implements OnInit {

  readonly SQUARE_DURATION = 700;
  readonly SCAN_DURATION = 1200;
  readonly PULL_DURATION = 600;
  readonly SHIELD_FORGE_DURATION = 600;
  readonly SHIELD_HOLD_DURATION = 900;
  readonly ABSORB_DURATION = 900;
  readonly SHIELD_GROW_DURATION = 1100;
  readonly LIGHT_EXPAND_DURATION = 1200;
  readonly BACKGROUND_REVEAL_DURATION = 1000;
  readonly SHIELD_DISSOLVE_DURATION = 700;

  /**
   * Single source of truth for the whole success-animation sequence.
   * It only ever moves FORWARD through these steps — nothing downstream
   * ever flips a flag back to an earlier state, which is what was
   * causing the OTP card to reappear after it had already faded away.
   */
  phase: Phase = 'INPUT';
  errorMessage = '';

isError = false;

  otp = ['', '', '', ''];

  // Linear (INPUT) layout — 64px boxes in a 300px-wide container
  nodes = [
    { x: 0, y: 8 },
    { x: 79, y: 8 },
    { x: 158, y: 8 },
    { x: 237, y: 8 }
  ];
  countdown = 60;

canResend = false;

private countdownTimer?: ReturnType<typeof setInterval>;
  nodeScale = [1, 1, 1, 1];
  nodeOpacity = [1, 1, 1, 1];
  scannedIndex = -1;

  @ViewChildren('otpInput')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() email = '';
  @Input() title = 'Verify your Email';
  @Input() subtitle = "We've sent a 4-digit verification code to";
  @Input() purpose = 'REGISTER';

  @Output() verified = new EventEmitter<string>();

  focusedIndex = 0;

  @Output()
resendRequested = new EventEmitter<void>();
@Output()
cancel = new EventEmitter<void>();

  ngOnInit(): void {

    this.startCountdown();

}

cancelVerification(): void {

    this.cancel.emit();

}


  get showCard(): boolean {
    return this.phase === 'INPUT' || this.phase === 'SQUARE' || this.phase === 'SCAN' ||
      this.phase === 'PULL' || this.phase === 'MORPH' || this.phase === 'ABSORB';
  }

  get isSquareMode(): boolean {
    return this.phase === 'SQUARE' || this.phase === 'SCAN' ||
      this.phase === 'PULL' || this.phase === 'MORPH';
  }


  get showScanner(): boolean {
    return this.phase === 'SQUARE' || this.phase === 'SCAN' || this.phase === 'PULL';
  }


  get showMorphShield(): boolean {
    return this.phase === 'MORPH' || this.phase === 'ABSORB' || this.phase === 'GROW' ||
      this.phase === 'LIGHT' || this.phase === 'REVEAL' || this.phase === 'SUCCESS';
  }


  onInput(event: Event, index: number): void {
    this.errorMessage = '';
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    this.otp[index] = value;
    input.value = value;

    if (value && index < 3) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }

    if (this.otp.every(digit => digit !== '')) {
      setTimeout(() => {
        this.verifyOtp();
      }, 150);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.otp[index] && index > 0) {
        this.otpInputs.get(index - 1)?.nativeElement.focus();
      }
      this.otp[index] = '';
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    }

    if (event.key === 'ArrowRight' && index < 3) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted = event.clipboardData
      ?.getData('text')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (!pasted) {
      return;
    }

    pasted.split('').forEach((digit, index) => {
      this.otp[index] = digit;
    });

    this.otpInputs.forEach((input, index) => {
      input.nativeElement.value = this.otp[index];
    });

    this.otpInputs.last.nativeElement.blur();

if (this.otp.every(digit => digit !== '')) {

    setTimeout(() => {

        this.verifyOtp();

    }, 150);

}
  }

  verifyOtp(): void {
    if (this.otp.join('').length !== 4) {
      return;
    }
    this.verified.emit(this.otp.join(''));
  }

resendOtp(): void {

    if (!this.canResend) {
        return;
    }

    this.resendRequested.emit();

}
  // ---------- Success animation ----------

  playSuccessAnimation(): void {
    let t = 0;

    // Step 1 - form the square
    this.phase = 'SQUARE';
    this.moveToSquare();

    // Step 2 - scanner sweeps
    t += this.SQUARE_DURATION;
    setTimeout(() => {
      this.phase = 'SCAN';
      this.playScanner();
    }, t);

    // Step 3 - magnetic pull
    t += this.SCAN_DURATION;
    setTimeout(() => {
      this.phase = 'PULL';
    }, t);
    setTimeout(() => {
      this.magneticPull();
    }, t + 250);

    // Step 4 - shield forges, then holds
    t += this.PULL_DURATION;
    setTimeout(() => {
      this.phase = 'MORPH';
    }, t);

    // Step 5 - the (now tiny) card fades away for good — no going back
    t += this.SHIELD_FORGE_DURATION;
    setTimeout(() => {
      this.phase = 'ABSORB';
    }, t);

    // Step 6 - shield grows
t += this.ABSORB_DURATION;

setTimeout(() => {

    this.phase = 'GROW';

}, t);

t += this.SHIELD_GROW_DURATION;
    setTimeout(() => {
      this.phase = 'REVEAL';
    }, t);

    // Step 9 - done
    t += this.BACKGROUND_REVEAL_DURATION;
    setTimeout(() => {
      this.phase = 'SUCCESS';
    }, t);

    t += this.SHIELD_DISSOLVE_DURATION;
    setTimeout(() => {
      this.phase = 'EXIT';
    }, t);
  }

  private moveToSquare(): void {
    // 220px container, 64px boxes, 28px gap → grid is 156px wide,
    // centred with a 32px margin on every side.
    this.nodes = [
      { x: 38, y: 38 },
      { x: 138, y: 38 },
      { x: 38, y: 138 },
      { x: 138, y: 138 }
    ];
  }

  private magneticPull(): void {
    // Move all boxes to the exact centre of the 220px container:
    // (220 - 64) / 2 = 78
    this.nodes = [
      { x: 78, y: 78 },
      { x: 78, y: 78 },
      { x: 78, y: 78 },
      { x: 78, y: 78 }
    ];

    setTimeout(() => { this.nodeScale = [.8, .8, .8, .8]; }, 150);
    setTimeout(() => { this.nodeScale = [.55, .55, .55, .55]; }, 350);
    setTimeout(() => { this.nodeScale = [.3, .3, .3, .3]; }, 550);
    setTimeout(() => { this.nodeScale = [.15, .15, .15, .15]; }, 800);
  }

  private playScanner(): void {
    [0, 1, 2, 3].forEach((index, order) => {
      setTimeout(() => {
        this.scannedIndex = index;
        setTimeout(() => {
          if (this.scannedIndex === index) {
            this.scannedIndex = -1;
          }
        }, 180);
      }, order * 180);
    });
  }

  private startCountdown(): void {

    this.canResend = false;

    this.countdown = 60;

    if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {

        this.countdown--;

        if (this.countdown <= 0) {

            clearInterval(this.countdownTimer);

            this.canResend = true;

        }

    }, 1000);

}

public resetAfterResend(): void {

    this.otp = ['', '', '', ''];

    this.otpInputs.forEach(input => {

        input.nativeElement.value = '';

    });

    this.focusedIndex = 0;

    this.otpInputs.first.nativeElement.focus();

    this.startCountdown();

}

public showVerificationError(
    message: string,
    remainingAttempts?: number
): void {

    this.errorMessage = message;

    this.isError = true;

    // Let the user SEE the shake & glow first
    setTimeout(() => {

        // Clear OTP
        this.otp = ['', '', '', ''];

        this.otpInputs.forEach(input => {

            input.nativeElement.value = '';

        });

        this.focusedIndex = 0;

        this.otpInputs.first.nativeElement.focus();

    }, 500);

    // Remove animation state
    setTimeout(() => {

        this.isError = false;

    }, 700);

}
}