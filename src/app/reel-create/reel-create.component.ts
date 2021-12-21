import { Component, OnInit, SecurityContext } from '@angular/core';
import { SortablejsModule } from 'ngx-sortablejs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataReel} from '../data-reel';
import { ReelManagerService } from '../reel-manager.service';
import { Router } from '@angular/router';
interface FileObject {
  url: string;
  file: number;
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

  constructor(private sanitizer: DomSanitizer,
    private reelManagerService: ReelManagerService,
    private router: Router
  ) { }
 

  ngOnInit(): void {
    let datos = this.reelManagerService.getReelData()
    //If we come back from reel-player
    if (datos != null) {
      this.preparedReel = true;
    }
  }

  startReel() {
    this.reelManagerService.setReelData(this.datosReel);
    this.router.navigate(["/reel-player"]);
  }
  
  saveReel() {
    this.inicializaDatosReel();
    var datosEnviar = [];

    for (var i = 0; i < this.files.length; i++) {
      var elementoImagen = <HTMLImageElement>document.getElementById(i.toString());
      var elementoImagenUrl = elementoImagen.src;

      var fileNumber = 0;
      this.fileObjects.forEach((f) => {
        if (f.url == elementoImagenUrl) {
          fileNumber = f.file;
        } 
      });

      var input = <HTMLInputElement>document.getElementById("input" + fileNumber.toString());
      var segundosImagen = parseInt(input.value);

      var data ={
        archivo: this.files[i],
        segundosImagen: segundosImagen,
        orden: fileNumber,
      }
      this.datosReel.splice(fileNumber, 0, data);
    }
    if (this.datosReel.length >= 1) this.preparedReel = true;
    }

  inicializaDatosReel() {
    for (var i = 0; i < this.files.length; i++) {
      var file = new File(new Array<Blob>(), "Mock.zip", { type: 'application/zip' });

      this.datosReel[i] = {
        archivo: file,
        segundosImagen: 0,
        orden: 0
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

  generateFileUrls(files: any){
  for (var i = 0; i < files.length; i++) {
    var stringUrl = URL.createObjectURL(files[i]);
    var url = this.sanitize(stringUrl)
    this.images[i] = url;


    var sanitizedUrl = <string>this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(stringUrl));

    let f: FileObject = {
      url: sanitizedUrl,
      file: i
    }
    this.fileObjects.push(f);
  }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
