import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Profile } from '../../../shared/modal/profile';

@Component({
    selector: 'app-profile-header',
    imports: [ButtonModule, CommonModule, FormsModule],
    templateUrl: './profile-header.component.html',
    styleUrl: './profile-header.component.css'
})
export class ProfileHeaderComponent {

    @Input({ required: true })
    profile!: Profile;

    @Output()
    editProfile = new EventEmitter<void>();
    @Output()
    imageSelected = new EventEmitter<File>();

    profileImage: string | null = null;
    isHovering = false;
   

    onEditProfile(): void {
        this.editProfile.emit();
    }

   onProfileImageSelected(event: Event): void {

        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        this.imageSelected.emit(input.files[0]);

        input.value = '';

    }

}
