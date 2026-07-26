import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-help-card',
  imports: [ButtonModule],
  templateUrl: './help-card.component.html',
  styleUrl: './help-card.component.css'
})
export class HelpCardComponent {

  constructor(private router: Router) {}

  goToDocumentation(): void {
    this.router.navigate(['/documentation']);
}

}
