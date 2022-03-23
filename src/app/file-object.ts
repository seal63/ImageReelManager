import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface FileObject {
  url: string;
  fileNumber: number;
  archivo: File;
}
