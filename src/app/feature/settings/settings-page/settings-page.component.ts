import { Component } from '@angular/core';
import { AccountCardComponent } from '../components/account-card/account-card.component';
import { StorageCardComponent } from '../components/storage-card/storage-card.component';
import { PreferencesCardComponent } from '../components/preferences-card/preferences-card.component';
import { DangerZoneCardComponent } from '../components/danger-zone-card/danger-zone-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  imports: [AccountCardComponent, StorageCardComponent, DangerZoneCardComponent, PreferencesCardComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {

  constructor(
    private router: Router
) {}

goBack(): void {
    this.router.navigate(['/home']);
}

}
