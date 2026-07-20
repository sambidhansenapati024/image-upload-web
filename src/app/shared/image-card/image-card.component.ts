import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ImageResponse } from '../modal/image-response';

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
view = new EventEmitter<ImageResponse>();

@Input({ required: true })
image!: ImageResponse;

@Output()
download = new EventEmitter<string>();

}
