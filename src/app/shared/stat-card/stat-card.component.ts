import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stat-card',
  imports: [CardModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title = '';

 @Input() value: string | number = '';

  @Input() icon = '';

  @Input() color = '#2563EB';

}
