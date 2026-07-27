import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FloatLabel, FloatLabelModule } from "primeng/floatlabel";
import { Card, CardModule } from "primeng/card";
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, ReactiveFormsModule, FloatLabel, Card,InputTextModule,FloatLabelModule,ButtonModule,CardModule ,RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  successMessage = false;
  loading = false;

    forgotPasswordForm: FormGroup;
    cooldown = 60;
canResend = false;

private countdownInterval: any;

  constructor(private fb: FormBuilder,
     private authService: AuthService
  ) {

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

  }

  onSubmit(): void {

  if (this.forgotPasswordForm.invalid) {
    this.forgotPasswordForm.markAllAsTouched();
    return;
  }

  // Show loading overlay
  this.loading = true;

  this.authService
    .forgotPassword(this.forgotPasswordForm.value.email)
    .subscribe({

      next: () => {

    setTimeout(() => {

        this.loading = false;
        this.successMessage = true;
         this.startCooldown();

    }, 400);

},
      error: (error) => {

        // Hide loading overlay
        this.loading = false;

        console.error(error);

      }

    });

}

resendEmail(): void {

  this.loading = true;

  const email = this.forgotPasswordForm.get('email')?.value;

  this.authService
      .forgotPassword(email)
      .subscribe({

        next: () => {

          this.loading = false;
          this.startCooldown();


        },

        error: () => {

          this.loading = false;

        }

      });

}

startCooldown(): void {

  this.canResend = false;
  this.cooldown = 60;

  clearInterval(this.countdownInterval);

  this.countdownInterval = setInterval(() => {

    this.cooldown--;

    if (this.cooldown <= 0) {

      clearInterval(this.countdownInterval);

      this.canResend = true;

    }

  }, 1000);

}

}
