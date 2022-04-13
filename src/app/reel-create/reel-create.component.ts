import { Component, OnInit, SecurityContext, Renderer2, HostListener, ElementRef, ViewChild } from '@angular/core';
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

  x1 = 0; y1 = 0; x2 = 0; y2 = 0;
  @ViewChild('selector') selector?: ElementRef;
  constructor(private sanitizer: DomSanitizer,
    private reelManagerService: ReelManagerService,
    private router: Router, public dialog: MatDialog,
    private renderer: Renderer2
  ) { }

 
  ngOnInit(): void {
    this.prepareKeyUpEvents();
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
      subscription = sourceSecond.subscribe((val: any) => this.restoreSession(subscription));
    }
    const source = <HTMLElement>document.getElementById('globalInput');
    source.addEventListener('input', this.globalInput);
  }
  prepareKeyUpEvents() {
    document.body.onkeyup = (e) => {
      let key = e.keyCode;
      if (e.code == "Enter" ||
        e.keyCode == 13
      ) {
        this.saveReel();
      }
      if (document.getSelection() && !this.existsInputFocused()) {
        e.preventDefault();
        let character = String.fromCharCode(key);
        if (!Number.isNaN(Number(character)) || e.keyCode == 8) {
          this.setSelectionOnInputs(character, e.keyCode);
        }
      }
    }
  }
  getNumber(firstDigitPosition: number, text: string) {
    for (let i = firstDigitPosition + 1; i < text.length; i++) {
      if (text.charAt(i) == '\"') {
        return text.substring(firstDigitPosition, i);
      }
    }
    return "-1";
  }
  setSelectionOnInputs(character: any, keyCode: any) {
    var selObj = document.getSelection();

    const htmlAnchor = (<HTMLElement>selObj?.anchorNode!).innerHTML;
    const htmlExtend = (<HTMLElement>selObj?.focusNode!).innerHTML;

    let posicionAnchor = htmlAnchor!.indexOf('id=\"input') + 9;
    let posicionExtend = htmlExtend!.indexOf('id=\"input') + 9;

    if (posicionAnchor == 8)
      posicionAnchor = htmlAnchor!.indexOf('id=\"') + 4;

    if (posicionExtend == 8)
      posicionExtend = htmlExtend!.indexOf('id=\"') + 4;

    let startString = this.getNumber(posicionExtend, htmlExtend!);
    let endString = this.getNumber(posicionAnchor, htmlAnchor!);

    if (parseInt(startString) > parseInt(endString)) {
      let temporal = startString;
      startString = endString;
      endString = temporal;
    }


    let startNumber = parseInt(startString);
    let endNumber = parseInt(endString);

    for (let i = startNumber; i <= endNumber; i++) {
      var input = <HTMLInputElement>document.getElementById("input" + i.toString());
      if (!input.value) {
        input.value = "";
      }
      if (keyCode != 8) {
        input.value = input.value + character;
      } else {
        input.value = input.value.substring(0, input.value.length - 1);
      }

    }
  }

  existsInputFocused() {
    if (!document.activeElement) return false;
    return (document.activeElement!.nodeName == "INPUT")
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

      var input = <HTMLInputElement>document.getElementById("input" + i.toString());
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
      if (result) {
      let internetUrls = result.split('\n');

      this.joinInternetUrls(internetUrls);;
      }
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

  mouseUpDropZone(e: any) {
    let rectangle = document.getElementById("rectangle-selection")!;
    rectangle.style.visibility = "hidden";
  }

  mouseDownDropZone(e: any) {
    
    if (!$(e.target).closest('#div-imagenes').length) {

      let s = window.getSelection()!;
      if (s.rangeCount >= 1) {
        for (var i = 0; i < s.rangeCount; i++) {
          s.removeRange(s.getRangeAt(i));
        }
      }


      this.x1 = e.clientX;
      this.y1 = e.clientY;
      let rectangle = document.getElementById("rectangle-selection")!;
      rectangle.style.top = this.y1.toString() + 'px';
      rectangle.style.left = this.x1.toString() + 'px';

      rectangle.style.height = '0px';
      rectangle.style.width = '0px';

      rectangle.style.visibility = "visible";
    }
   
  }
  clickImageDiv(ev: any) {
    ev.stopPropagation();
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    let rectangle = document.getElementById("rectangle-selection")!;

    let offsetX = this.x1 - e.clientX;
    let offsetY = this.y1 - e.clientY;

    let translateY = '0px';
    let translateX = '0px';
    if (offsetY > 0) {
      translateY = (offsetY * (-1)).toString() + 'px';
    } 
  
    if (offsetX > 0) {
      translateX = (offsetX * (-1)).toString() + 'px';
    }

    rectangle.style.transform = 'translate(' + translateX + ', ' + translateY + ')'
    let width = (Math.abs(offsetX)).toString();
    rectangle.style.width = width + 'px';
    let height = (Math.abs(offsetY)).toString();
    rectangle.style.height = height + 'px';

  }

  reCalc() {
   
  }
}
