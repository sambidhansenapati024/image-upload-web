import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-image-card',
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.css'
})
export class ImageCardComponent {

@Output()

delete = new EventEmitter<string>();

@Output()

view = new EventEmitter<string>();

@Input()

image='';

@Output()
download = new EventEmitter<string>();

}
