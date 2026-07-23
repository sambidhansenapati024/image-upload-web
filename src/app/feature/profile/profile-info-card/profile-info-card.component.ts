import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-profile-info-card',
  imports: [CommonModule,
    CardModule],
  templateUrl: './profile-info-card.component.html',
  styleUrl: './profile-info-card.component.css'
})
export class ProfileInfoCardComponent {

}
