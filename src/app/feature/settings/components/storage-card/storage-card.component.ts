import { Component } from '@angular/core';
import { ProgressBar } from "primeng/progressbar";

@Component({
  selector: 'app-storage-card',
  imports: [ProgressBar],
  templateUrl: './storage-card.component.html',
  styleUrl: './storage-card.component.css'
})
export class StorageCardComponent {

  storageUsed = '2.4 GB';

storageLimit = '10 GB';

storagePercentage = 24;

storagePlan = 'Free Plan';

}
