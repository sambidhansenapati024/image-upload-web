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
@Input()
mode: 'gallery' | 'recycle' = 'gallery';

@Output()
restore = new EventEmitter<number>();

@Output()
deleteForever = new EventEmitter<number>();

formatFileSize(bytes: number): string {

  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(size < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

getTimeAgo(date: string): string {

  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years > 1 ? 's' : ''} ago`;
}

}
