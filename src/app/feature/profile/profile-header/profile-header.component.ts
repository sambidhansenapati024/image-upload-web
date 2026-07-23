import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile-header',
  imports: [ButtonModule, CommonModule, FormsModule],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.css'
})
export class ProfileHeaderComponent {
  profileImage: string | null = null;
  isHovering = false;
onProfileImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {

        return;

    }

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {

    return;

}

    const reader = new FileReader();

    reader.onload = () => {

        this.profileImage = reader.result as string;
         this.isHovering = false;

    };

    reader.readAsDataURL(file);

}

}
