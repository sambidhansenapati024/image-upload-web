import { Component } from '@angular/core';
import { HelpCardComponent } from '../help-card/help-card.component';
import { FaqCardComponent } from '../faq-card/faq-card.component';

@Component({
  selector: 'app-help-center-page',
  imports: [ HelpCardComponent,
  FaqCardComponent],
  templateUrl: './help-center-page.component.html',
  styleUrl: './help-center-page.component.css'
})
export class HelpCenterPageComponent {

}
