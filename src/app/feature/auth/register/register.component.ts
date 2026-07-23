import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../shared/modal/register-request';

export const passwordMatchValidator: ValidatorFn =
(control: AbstractControl): ValidationErrors | null => {

    const password = control.get('password')?.value;

    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
        return null;
    }

    return password === confirmPassword
        ? null
        : { passwordMismatch: true };

};
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        PasswordModule,
        InputTextModule,
        FloatLabelModule,
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    registerForm!: FormGroup;

    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {

        this.registerForm = this.fb.group({

            fullName: ['', Validators.required],

            email: ['', [
                Validators.required,
                Validators.email
            ]],

            password: ['', [
                Validators.required,
                Validators.minLength(8)
            ]],

            confirmPassword: ['', Validators.required]

        }, {
            validators: passwordMatchValidator
        });

    }

    register(): void {

  if (this.registerForm.invalid) {

    this.registerForm.markAllAsTouched();
    return;

  }

  this.loading = true;

  const request: RegisterRequest = {

    fullName: this.registerForm.value.fullName,

    email: this.registerForm.value.email,

    password: this.registerForm.value.password

  };

  this.authService.register(request)
    .subscribe({

      next: (response) => {

        this.loading = false;

        if (response.success) {

          this.messageService.add({

            severity: 'success',

            summary: 'Registration Successful',

            detail: response.message

          });

          setTimeout(() => {

            this.router.navigate(['/login']);

          }, 1500);

        } else {

          this.messageService.add({

            severity: 'error',

            summary: 'Registration Failed',

            detail: response.message

          });

        }

      },

      error: (err) => {

        this.loading = false;

        this.messageService.add({

          severity: 'error',

          summary: 'Error',

          detail:
            err.error?.message ??
            'Unable to register.'

        });

      }

    });

}

}
