import { Injectable } from '@angular/core';
import { DataReel } from './data-reel';

interface FileObject {
  url: string;
  file: number;
  archivo: File;
}

@Injectable({
  providedIn: 'root'
})

export class ReelManagerService {

  data: {
    datosReel: DataReel[];
    images: any; fileObjects: FileObject[];
    files: File[]; preparedReel: boolean;
  }

  saveSession(data: { datosReel: DataReel[]; images: any; fileObjects: FileObject[]; files: File[]; preparedReel: boolean; }) {
    this.data = data;
  }

  getSession() {
    return this.data;
  }
  constructor() {
    this.data = {
      datosReel: [], images: [], fileObjects: [], files: [], preparedReel: false
    }
  }

  dataReel: DataReel[] = []

  getReelData(): DataReel[] {
    return this.dataReel;
  }

  setReelData(data : DataReel[]) {
    this.dataReel = data;
  }
}
