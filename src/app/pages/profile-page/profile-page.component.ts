import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileHeaderComponent } from '../../feature/profile/profile-header/profile-header.component';
import { ProfileInfoCardComponent } from "../../feature/profile/profile-info-card/profile-info-card.component";
import { StorageStatsCardComponent } from '../../feature/profile/storage-stats-card/storage-stats-card.component';
import { Profile } from '../../shared/modal/profile';
import { ProfileService } from '../../service/profile.service';
import { FormsModule } from '@angular/forms';
import { ProfileEditDialogComponent } from '../../feature/profile/profile-edit-dialog/profile-edit-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule,
    ProfileHeaderComponent,
    ProfileInfoCardComponent,
    StorageStatsCardComponent, FormsModule, ProfileEditDialogComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {

  profile?: Profile;
  showEditDialog = false;

  loading = false;

  constructor(private profileService: ProfileService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    this.loading = true;

    this.profileService.getMyProfile().subscribe({

      next: (response) => {
        this.profile = response;
        this.loading = false;
      },

      error: (error) => {
        console.error(error);
        this.loading = false;
      }

    });

  }

  updateProfile(request: any): void {

    this.profileService.updateProfile(request).subscribe({

      next: (response) => {

        this.showEditDialog = false;

        this.loadProfile();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });

      },

      error: (error) => {

        console.error(error);

      }

    });

  }

  uploadProfileImage(file: File): void {

    this.profileService.uploadProfileImage(file).subscribe({

      next: (response) => {

        this.loadProfile();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });

      },

      error: (error) => {

        console.error(error);

      }

    });

  }


  openEditDialog(): void {
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
  }

}
