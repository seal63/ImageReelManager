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

  constructor(private sanitizer: DomSanitizer,
    private reelManagerService: ReelManagerService,
    private router: Router
  ) {
    this.preparedReel = false;
  }
  datosReel: DataReel[] = [];
  images: any = [];
  fileObjects: FileObject[] = [];
  files: File[] = [];

  preparedReel: boolean;

  ngOnInit(): void {}

  startReel() {
    console.log(this.images);
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
    const file: File = event.target.files[0];
    this.files = event.target.files;

    //Si existe el archivo
    if (file) {
      const formData = new FormData();
      

      formData.append("thumbnail", file);

      //Generates an url per file and adds it to each source in the html
      var files = event.target.files;
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
  }

  
  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
