import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Profile } from '../../../shared/modal/profile';

@Component({
  selector: 'app-profile-info-card',
  imports: [CommonModule,
    CardModule],
  templateUrl: './profile-info-card.component.html',
  styleUrl: './profile-info-card.component.css'
})
export class ProfileInfoCardComponent {

  @Input({ required: true })
profile!: Profile;

}
