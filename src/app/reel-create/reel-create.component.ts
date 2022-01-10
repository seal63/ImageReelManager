import { Component, OnInit, SecurityContext } from '@angular/core';
import { SortablejsModule } from 'ngx-sortablejs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataReel} from '../data-reel';
import { ReelManagerService } from '../reel-manager.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import { ThemePalette } from '@angular/material/core';

interface FileObject {
  url: string;
  file: number;
  archivo: File;
}


@Component({
  selector: 'app-reel-create',
  templateUrl: './reel-create.component.html',
  styleUrls: ['./reel-create.component.css']
})
export class ReelCreateComponent implements OnInit {

  datosReel: DataReel[] = [];
  images: any = [];
  fileObjects: FileObject[] = [];
  files: File[] = [];
  preparedReel: boolean = false;

  randomizeButton: ThemePalette;
  error: boolean = false;
  constructor(private sanitizer: DomSanitizer,
    private reelManagerService: ReelManagerService,
    private router: Router
  ) { }
 

  ngOnInit(): void {
    let datos = this.reelManagerService.getReelData()
    //If we come back from reel-player
    if (datos != null) {
      let data = this.reelManagerService.getSession();
      this.datosReel = data.datosReel;
      this.fileObjects = data.fileObjects;
      this.files = data.files;
      this.images = data.images;
      this.preparedReel = data.preparedReel;

      let subscription: any;
      const sourceSecond = interval(0);
      subscription = sourceSecond.subscribe(val => this.restoreSession(subscription));
     
    }
  }
  restoreSession(subscription: any) {
     subscription.unsubscribe();
      for (var i = 0; i < this.datosReel.length; i++) {
        var fileNumber = 0;
        var archivo = this.files[0];
        this.datosReel.forEach((f) => {
          if (f.orden == i) {
            var input = <HTMLInputElement>document.getElementById("input" + i.toString());
            input.value = f.segundosImagen.toString();
          }
        });

      }
      const source = <HTMLElement>document.getElementById('globalInput');
      source.addEventListener('input', this.globalInput);
    }
   
  clearReel() {
    this.preparedReel = false;
    this.files = [];
    this.fileObjects = [];
    this.images = [];
    this.datosReel = [];
  }


  formFilled(): boolean {
    if (this.fileObjects.length == 0) {
      return false;
    }
    for (var i = 0; i < this.fileObjects.length; i++) {
      var input = <HTMLInputElement>document.getElementById("input" + i);
      if (input.value == "") {
        this.error = true;
        return false;
       
      }
    }
    this.error = false;
    return true;
}

  startReel() {

    //checks if the time input is not null
    if (!this.formFilled()) {
      return;
    }
    let data = {
      datosReel: this.datosReel,
      images: this.images,
      fileObjects: this.fileObjects,
      files: this.files,
      preparedReel: this.preparedReel
    }
    

    this.reelManagerService.saveSession(data)
    this.reelManagerService.setReelData(this.datosReel);

    if (this.randomizeButton == "primary") {
      this.randomizeReel();
    }
    this.router.navigate(["/reel-player"]);
  }
  randomizeReel() {
    var l = this.datosReel.length;
    var iterations = 100;
    for (var i = 0; i < iterations; i++) {
      var randomPosition = Math.floor(Math.random() * (l-1));
      var saved = this.datosReel[l-1];
      var moved = this.datosReel[randomPosition];
      moved.orden = l-1;
      this.datosReel[l-1] = moved;
      saved.orden = randomPosition;
      this.datosReel[randomPosition] = saved;
    }
  }

  saveReel() {
    this.inicializaDatosReel();
    var datosEnviar = [];



    for (var i = 0; i < this.fileObjects.length; i++) {
      var elementoImagen = <HTMLImageElement>document.getElementById(i.toString());
      var elementoImagenUrl = elementoImagen.src;

      var fileNumber = 0;
      var archivo = this.files[0];
      this.fileObjects.forEach((f) => {
        if (f.url == elementoImagenUrl) {
          fileNumber = f.file;
          archivo = f.archivo;
        } 
      });

      var input = <HTMLInputElement>document.getElementById("input" + fileNumber.toString());
      var segundosImagen = parseInt(input.value);

      var data ={
        archivo: archivo,
        segundosImagen: segundosImagen,
        orden: fileNumber,
      }
      this.datosReel.splice(i, 1, data);
    }
    if (this.datosReel.length >= 1) this.preparedReel = true;

    this.startReel()
  }

  inicializaDatosReel() {
    this.datosReel = [];
    for (var i = 0; i < this.fileObjects.length; i++) {
      var file = new File(new Array<Blob>(), "Mock.zip", { type: 'application/zip' });

      this.datosReel[i] = {
        archivo: file,
        segundosImagen: 0,
        orden: 0
      };
    }
  }

  onFolderSelected(event: any) {
    this.files = event.target.files;
    if (event.target.files[0]) {
      var files = event.target.files;
      this.generateFileUrls(files);
    }
  }
  onFileSelected(event: any) {
    this.files = event.target.files;
    if (event.target.files[0]) {
      var files = event.target.files;
      this.generateFileUrls(files);
    }
  }

  //Generates an url per file and stores them in this.fileObjects
  generateFileUrls(files: any) {
    var number = this.images.length;
    for (var i = 0; i < files.length; i++) {
    var stringUrl = URL.createObjectURL(files[i]);
    var url = this.sanitize(stringUrl)
    this.images[number] = url;


    var sanitizedUrl = <string>this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(stringUrl));

    let f: FileObject = {
      url: sanitizedUrl,
      file: this.fileObjects.length,
      archivo: files[i]
    }
    this.fileObjects.push(f);
    number++;
  }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  globalInput(fileObjects: any) {
    var globalInput = <HTMLInputElement>document.getElementById("globalInput");
    var fin = false;
    var i = 0;
    while (!fin) {
      var input = <HTMLInputElement>document.getElementById("input" + i);
      if (input == null) {
        return;
      }
      input.value = globalInput.value;
      i++
    }
  }

  randomize() {
    if (this.randomizeButton === 'primary') {
      this.randomizeButton = undefined;
    }
    else {
      this.randomizeButton = 'primary';
    }
    
  }

  isRandom() {
    if (this.randomizeButton === 'primary') {
      return true;
    }
    else {
      return false;
    }

  }
}
