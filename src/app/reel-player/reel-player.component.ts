import { Component, OnInit, Input, SecurityContext} from '@angular/core';
import { DataReel } from '../data-reel';
import { ActivatedRoute } from '@angular/router';
import { ReelManagerService } from '../reel-manager.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import 'rxjs/add/operator/map';
@Component({
  selector: 'app-reel-player',
  templateUrl: './reel-player.component.html',
  styleUrls: ['./reel-player.component.css']
})
export class ReelPlayerComponent implements OnInit {

  constructor(private _route: ActivatedRoute,
    private reelManagerService: ReelManagerService,
    private sanitizer: DomSanitizer,) {

  }
  reelData: DataReel[] =[];
  imagenActual: SafeUrl = "";
  numeroImagenActual: number = 0;
  subscription!: any;
  observer!: Observable<number>;
  ngOnInit(): void {
    this.reelData = this.reelManagerService.getReelData();
    this.imagenActual = this.sanitize(URL.createObjectURL(this.reelData[0].archivo));
  } 
  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  start() {
    //emit value in sequence every 10 second
    const source = interval(<number>this.reelData[0].segundosImagen * 1000);
    this.subscription = source.subscribe(val => this.nextImage());
  }

  nextImage() {
    this.subscription.unsubscribe();
    this.numeroImagenActual++;

    this.imagenActual = this.sanitize(URL.createObjectURL(this.reelData[this.numeroImagenActual].archivo));
    const source = interval(<number>this.reelData[this.numeroImagenActual].segundosImagen * 1000);
    this.subscription = source.subscribe(val => this.nextImage());
  }


ngOnDestroy() {
 
}
}
