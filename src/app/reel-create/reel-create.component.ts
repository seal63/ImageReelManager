import { Component, OnInit, SecurityContext } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SortablejsModule } from 'ngx-sortablejs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataReel } from '../data-reel';
import { ReelManagerService } from '../reel-manager.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FileObject } from '../file-object';
import { ReelDialogComponent } from '../reel-dialog/reel-dialog.component';
import { serializeNodes } from '@angular/compiler/src/i18n/digest';


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
  dragCounter = 0;
  randomizeButton: ThemePalette;
  error: boolean = false;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  constructor(private sanitizer: DomSanitizer,
    private reelManagerService: ReelManagerService,
    private router: Router, public dialog: MatDialog
  ) { }

  setSelectionOnInputs(character: any, keyCode: any) {
    var selObj = document.getSelection();
    let anchorNode = <HTMLElement>selObj?.anchorNode!;
    let extendNode = <HTMLElement>selObj?.focusNode!;

    const htmlAnchor = anchorNode.innerHTML;
    const htmlExtend = extendNode.innerHTML;

    let posicionAnchor = htmlAnchor!.indexOf('id=\"input');
    let posicionExtend = htmlExtend!.indexOf('id=\"input');
    let startChar = htmlAnchor!.charAt(posicionAnchor + 9);
    let endChar = htmlExtend!.charAt(posicionExtend + 9);
    if (parseInt(startChar) > parseInt(endChar)) {
      let temporal = startChar;
      startChar = endChar;
      endChar = temporal;
    }
    let startNumber = parseInt(startChar);
    let endNumber = parseInt(endChar)
    for (let i = startNumber; i <= endNumber; i++) {
      var input = <HTMLInputElement>document.getElementById("input" + i.toString());
      if (keyCode != 8) {
        input.value = input.value + character;
      } else {
        input.value = input.value.substring(1);
      }
    
    }
  }
 
  ngOnInit(): void {
    document.body.onkeyup = (e) => {
      let key = e.keyCode;
      if (e.code == "Enter" ||
        e.keyCode == 13
      ) {
        this.saveReel();
      }
      if (document.getSelection() && !document.activeElement) {
        console.log(document.getSelection());
        e.preventDefault();
          let character = String.fromCharCode(key);
          if (!Number.isNaN(Number(character)) || e.keyCode == 8) {
            this.setSelectionOnInputs(character, e.keyCode);
          }
        }
      
    }

    let datos = this.reelManagerService.getReelData()
    //If we come back from reel-player
    if (datos.length != 0) {
      let data = this.reelManagerService.getSession();
      this.datosReel = data.datosReel;
      this.fileObjects = data.fileObjects;
      this.files = data.files;
      this.images = data.images;
      this.preparedReel = data.preparedReel;

      let subscription: any;
      //Waiting so it can access and restore the time inputs
      const sourceSecond = interval(0);
      subscription = sourceSecond.subscribe(val => this.restoreSession(subscription));
    }
    const source = <HTMLElement>document.getElementById('globalInput');
    source.addEventListener('input', this.globalInput);
  }

  //Restores the time inputs
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
  }

  clearReel() {
    this.preparedReel = false;
    this.files = [];
    this.fileObjects = [];
    this.images = [];
    this.datosReel = [];
  }

  //Checks if the inputs are filled and correct
  formFilled(): boolean {
    if (this.fileObjects.length == 0) {
      return false;
    }
    for (var i = 0; i < this.fileObjects.length; i++) {
      var input = <HTMLInputElement>document.getElementById("input" + i);
      if (input.value == "" || isNaN(Number(input.value))) {
        this.error = true;
        return false;

      }
    }
    this.error = false;
    return true;
  }

  startReel() {
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
      var randomPosition = Math.floor(Math.random() * (l - 1));
      var saved = this.datosReel[l - 1];
      var moved = this.datosReel[randomPosition];
      moved.orden = l - 1;
      this.datosReel[l - 1] = moved;
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
      var archivo = new File([""], "empty");
      let url = "";
      this.fileObjects.forEach((f) => {
        if (f.url == elementoImagenUrl) {
          fileNumber = f.fileNumber;
          archivo = f.archivo;
          url = f.url;
        }
      });

      let local = true;

      if (archivo.name == "empty") {
        local = false;
      } else {
        url = "";
      }

      var input = <HTMLInputElement>document.getElementById("input" + fileNumber.toString());
      var segundosImagen = parseInt(input.value);

      var data = {
        archivo: archivo,
        segundosImagen: segundosImagen,
        orden: fileNumber,
        url: url,
        local: local
      }
      this.datosReel.splice(i, 1, data);
    }
    if (this.datosReel.length > 0) this.preparedReel = true;

    this.startReel()
  }

  inicializaDatosReel() {
    this.datosReel = [];
    for (var i = 0; i < this.fileObjects.length; i++) {
      var file = new File(new Array<Blob>(), "Mock.zip", { type: 'application/zip' });

      this.datosReel[i] = {
        archivo: file,
        segundosImagen: 0,
        orden: 0,
        local: true,
        url: ""
      };
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
        fileNumber: this.fileObjects.length,
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

  goBack() {
    this.router.navigate(["/menu"]);
  }


  addInternetUrls() {
    let dialogRef = this.dialog.open(ReelDialogComponent, {
      height: '500px',
      width: '500px',
    });


    dialogRef.afterClosed().subscribe(result => {
      let internetUrls = result.split('\n');

      this.joinInternetUrls(internetUrls);;

    });
  }

  joinInternetUrls(internetUrls: string[]) {
    internetUrls.forEach(url => {

      if (url != "") {
        let f: FileObject = {
          url: url,
          fileNumber: this.fileObjects.length,
          archivo: new File([""], "empty")
        }

        this.fileObjects.push(f);
        this.images[this.images.length] = url;
      }

    });
    return internetUrls;
  }

  deleteImage(imagesIndex: number) {


    let posicionImagen = 0;
    for (let i = 0; this.fileObjects.length > i; i++) {
      let file = this.fileObjects[i];
      let urlImage = "";
      if (this.images[imagesIndex].changingThisBreaksApplicationSecurity) {
        urlImage = this.images[imagesIndex].changingThisBreaksApplicationSecurity;
      } else {
        urlImage = this.images[imagesIndex];
      }
      if (file.url == urlImage) {
        posicionImagen = i;
        this.fileObjects.splice(i, 1);
      }
    }
    this.images.splice(imagesIndex, 1);
    for (let i = posicionImagen; this.fileObjects.length > i; i++) {
      this.fileObjects[i].fileNumber = this.fileObjects[i].fileNumber - 1;
    }


  }


  dropHandler(ev: any) {
    ev.preventDefault();
    let files = [];
    if (ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          files.push(ev.dataTransfer.items[i].getAsFile());
        }
      }
    }
    ev.preventDefault();
    this.generateFileUrls(files);
  }

  allowDrop(ev: any) {
    ev.preventDefault();
   
  }

  removeDragData(ev: any) {
    if (ev.dataTransfer.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.dataTransfer.clearData();
    }
  }
}
