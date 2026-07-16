import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-toast',
  imports: [CommonModule],
  templateUrl: './update-toast.component.html',
  styleUrl: './update-toast.component.css'
})
export class UpdateToastComponent {
   @Input() visible = false;
  @Input() countdown = 5;

  @Output() reloadNow = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

}
