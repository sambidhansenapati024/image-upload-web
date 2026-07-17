import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ImageCardComponent } from '../image-card/image-card.component';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, ImageCardComponent, GalleriaModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnChanges {
  display = false;
  activeIndex = 0;
  galleryImages: any[] = [];

  @Input()
  images: string[] = [];

  @Output()
  delete = new EventEmitter<string>();
  @Output()
download = new EventEmitter<string>();

  ngOnChanges() {

    this.galleryImages = this.images.map(image => ({
        itemImageSrc: image,
        thumbnailImageSrc: image
    }));
     console.log(this.galleryImages);
}

openImage(image: string) {
 console.log("Clicked:", image);
    this.activeIndex = this.images.indexOf(image);

    this.display = true;

}


}
