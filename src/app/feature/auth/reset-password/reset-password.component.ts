import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { Card, CardModule } from "primeng/card";
import { FloatLabel, FloatLabelModule } from "primeng/floatlabel";
import { Password, PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reset-password',
  imports: [ ReactiveFormsModule,
  PasswordModule,
  FloatLabelModule,
  CardModule,
  ButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  passwordRules = {
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
};

  token!: string;
  successMessage = '';

    resetPasswordForm: FormGroup;
    hasStartedTyping = false;
    loading = false;

  constructor(private fb: FormBuilder,
    private route : ActivatedRoute,
    private authService :AuthService,
     private router: Router
  ) {

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
  {
    validators: passwordMatchValidator
  });

  }

  ngOnInit(): void {

  this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

  this.resetPasswordForm.get('password')?.valueChanges.subscribe(value => {
    this.checkPasswordRules(value || '');
  });

  }

  checkPasswordRules(password: string): void {

  this.hasStartedTyping = password.length > 0;

  this.passwordRules.minLength = password.length >= 8;

  this.passwordRules.uppercase = /[A-Z]/.test(password);

  this.passwordRules.lowercase = /[a-z]/.test(password);

  this.passwordRules.number = /\d/.test(password);

  this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

}

get isPasswordStrong(): boolean {
  return Object.values(this.passwordRules).every(Boolean);
}


  onSubmit(): void {

  if (this.resetPasswordForm.invalid) {
    this.resetPasswordForm.markAllAsTouched();
    return;
  }

  this.loading=true

  const password = this.resetPasswordForm.value.password;

  this.authService
      .resetPassword(this.token, password)
      .subscribe({
      next: () => {

        this.loading=false;

  this.successMessage =
      'Your password has been reset successfully. Redirecting to login...';

  setTimeout(() => {

    this.router.navigate(['/login']);

  }, 2000);

},
        error: (error) => {

          console.error(error);

        }
      });

}

goToLogin(): void {

    this.router.navigate(['/login']);

}

}
