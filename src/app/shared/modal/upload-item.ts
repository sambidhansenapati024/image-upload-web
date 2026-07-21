export interface UploadItem {

  file: File;

  preview: string;

  progress: number;

  uploadedSize: string;

  totalSize: string;

  uploadSpeed: string;

  remainingTime: string;

  uploading: boolean;

  uploaded: boolean;

  failed: boolean;

   startTime: number;

}