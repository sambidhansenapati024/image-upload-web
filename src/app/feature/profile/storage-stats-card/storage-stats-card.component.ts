import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-storage-stats-card',
  imports: [CommonModule,
    CardModule,
    ProgressBarModule],
  templateUrl: './storage-stats-card.component.html',
  styleUrl: './storage-stats-card.component.css'
})
export class StorageStatsCardComponent {

}
