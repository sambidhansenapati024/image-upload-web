import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Profile } from '../../../shared/modal/profile';
import { Textarea } from 'primeng/inputtextarea';

@Component({
  selector: 'app-profile-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    Textarea
  ],
  templateUrl: './profile-edit-dialog.component.html',
  styleUrl: './profile-edit-dialog.component.css'
})
export class ProfileEditDialogComponent implements OnChanges {

   @Input() visible = false;

  @Input({ required: true })
  profile!: Profile;

  @Output()
  visibleChange = new EventEmitter<boolean>();

  @Output()
  save = new EventEmitter<any>();

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {

    this.profileForm = this.fb.group({

      phone: ['', Validators.required],

      country: ['', Validators.required],

      timezone: ['', Validators.required],

      bio: ['']

    });

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['profile'] && this.profile) {

      this.profileForm.patchValue({

        phone: this.profile.phone,

        country: this.profile.country,

        timezone: this.profile.timezone,

        bio: this.profile.bio

      });

    }

  }

  onCancel(): void {

    this.visibleChange.emit(false);

  }

  onSave(): void {

    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      return;

    }

    this.save.emit(this.profileForm.value);

  }

}
