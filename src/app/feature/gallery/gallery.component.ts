import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ImageCardComponent } from '../../shared/image-card/image-card.component';
import { GalleriaModule } from 'primeng/galleria';
import { ImageResponse } from '../../shared/modal/image-response';

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
images: ImageResponse[] = [];

  @Output()
  delete = new EventEmitter<string>();
  @Output()
download = new EventEmitter<string>();

  ngOnChanges() {

this.galleryImages = this.images.map(image => ({
    itemImageSrc: image.imageUrl,
    thumbnailImageSrc: image.imageUrl
}));
     console.log(this.galleryImages);
}

openImage(image: ImageResponse) {

    this.activeIndex = this.images.findIndex(img => img.id === image.id);

    this.display = true;

}


}
