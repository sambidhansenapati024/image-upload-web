import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileHeaderComponent } from '../../feature/profile/profile-header/profile-header.component';
import { ProfileInfoCardComponent } from "../../feature/profile/profile-info-card/profile-info-card.component";
import { StorageStatsCardComponent } from '../../feature/profile/storage-stats-card/storage-stats-card.component';

@Component({
  selector: 'app-profile-page',
   imports: [    CommonModule,
    ProfileHeaderComponent,
    ProfileInfoCardComponent,
  StorageStatsCardComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
