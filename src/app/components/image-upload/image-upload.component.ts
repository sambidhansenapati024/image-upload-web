import { Component, OnInit } from '@angular/core';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit  {
  selectedFile!: File;

  preview: any;

  progress = 0;

  images: string[] = [];

   constructor(private imageService: ImageUploadServiceService) {}

  ngOnInit(): void {
    console.log("hii")
     this.loadImages();
  }

  selectFile(event: any) {

    if (!event.target.files.length) {
      return;
    }

    this.selectedFile = event.target.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.preview = reader.result;
    };

    reader.readAsDataURL(this.selectedFile);
  }
    upload() {

    if (!this.selectedFile) {
      alert('Select an image first');
      return;
    }

    this.imageService.upload(this.selectedFile)
      .subscribe(event => {

        if (event.type === HttpEventType.UploadProgress) {

          this.progress = Math.round(
            (100 * event.loaded) / (event.total || 1)
          );

        }

        if (event.type === HttpEventType.Response) {

          alert('Image Uploaded Successfully');

          this.progress = 0;

          this.preview = null;

          this.selectedFile = null as any;

          this.loadImages();

        }

      });

  }

    loadImages() {

    this.imageService.getAllImage()
      .subscribe(data => {

        this.images = data;

      });

  }
 deleteImage(url: string) {

    const fileName = url.substring(url.lastIndexOf('/') + 1);

    this.imageService.deleteImage(fileName)
      .subscribe(() => {

        this.loadImages();

      });

  }



}
