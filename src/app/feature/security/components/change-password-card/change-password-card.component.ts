import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Password } from "primeng/password";
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password-card',
  imports: [Password, ButtonModule, ReactiveFormsModule,
    FormsModule],
  templateUrl: './change-password-card.component.html',
  styleUrl: './change-password-card.component.css'
})
export class ChangePasswordCardComponent {
  showChangePasswordForm = false;

  changePasswordForm!: FormGroup;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {

    this.changePasswordForm = this.fb.group({

      currentPassword: ['', Validators.required],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: ['', Validators.required]

    });

  }

  changePassword(): void {

    if (this.changePasswordForm.invalid) {

      this.changePasswordForm.markAllAsTouched();
      return;

    }

    this.authService
      .changePassword(this.changePasswordForm.getRawValue())
      .subscribe({

        next: (response) => {

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response
          });

          this.changePasswordForm.reset();

          this.showChangePasswordForm = false;

        },

        error: (error) => {

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error
          });

        }

      });

  }

}
