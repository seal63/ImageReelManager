import { Component, OnInit, Input, SecurityContext} from '@angular/core';
import { DataReel } from '../data-reel';
import { ActivatedRoute } from '@angular/router';
import { ReelManagerService } from '../reel-manager.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reel-player',
  templateUrl: './reel-player.component.html',
  styleUrls: ['./reel-player.component.css']
})
export class ReelPlayerComponent implements OnInit {

  constructor(private _route: ActivatedRoute,
    private reelManagerService: ReelManagerService,
    private sanitizer: DomSanitizer,
    private router: Router) {

  }
  started: boolean = false;
  reelData: DataReel[] =[];
  imagenActual: SafeUrl = "";
  numeroImagenActual: number = 0;
  subscription!: any;
  timerSubscription!: any;
  observer!: Observable<number>;
  remainingTime: number = 0;
  paused: boolean = false;

  icon: string = "pause";

  ngOnInit(): void {
    this.reelData = this.reelManagerService.getReelData();
    this.imagenActual = this.sanitize(URL.createObjectURL(this.reelData[0].archivo));

   
  }

  decrease() {

}

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  start() {
    //emit value in sequence every 10 second
    this.started = true;
    const source = interval(<number>this.reelData[0].segundosImagen * 1000);
    this.remainingTime = <number>this.reelData[0].segundosImagen;
    this.startTimer();
    this.subscription = source.subscribe(val => this.nextImage());
  }
  decreaseSecond() {
    this.remainingTime = this.remainingTime - 1;
  }

  startTimer() {
    const sourceSecond = interval(1000);
    this.timerSubscription = sourceSecond.subscribe(val => this.decreaseSecond())
  }

  playButton() {
    if (this.paused) {
      this.resume();
      this.icon = "pause"
    } else {
      this.pause();
      this.icon = "play_arrow"
    }
  }
  pause() {
    this.paused = true;
    this.timerSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }
  resume() {
    this.paused = false;
    const source = interval(this.remainingTime * 1000);
    this.subscription = source.subscribe(val => this.nextImage());
    this.startTimer();
  }

  nextImage() {
    
    this.subscription.unsubscribe();
    this.timerSubscription.unsubscribe();
    this.numeroImagenActual++;
    if (this.reelData.length == this.numeroImagenActual) {
      this.router.navigate(["/reel-create"]);
    }

    this.imagenActual = this.sanitize(URL.createObjectURL(this.reelData[this.numeroImagenActual].archivo));
    const source = interval(<number>this.reelData[this.numeroImagenActual].segundosImagen * 1000);

    this.remainingTime = <number>this.reelData[this.numeroImagenActual].segundosImagen;
    this.subscription = source.subscribe(val => this.nextImage());
    const sourceSecond = interval(1000);
    this.timerSubscription = sourceSecond.subscribe(val => this.decreaseSecond())
  }


ngOnDestroy() {
 
}
}
