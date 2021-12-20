import { Injectable } from '@angular/core';
import { DataReel } from './data-reel';

@Injectable({
  providedIn: 'root'
})
export class ReelManagerService {

  constructor() { }

  dataReel: DataReel[] = []

  getReelData(): DataReel[] {
    return this.dataReel;
  }

  setReelData(data : DataReel[]) {
    this.dataReel = data;
  }
}
