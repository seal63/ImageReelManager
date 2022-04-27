import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { PhysicalPosition } from '@tauri-apps/api/window';
import { window } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/tauri';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

var alwaysOnTop = false;
var decorations = true;
var ctrlPressed = false;

document.addEventListener('keydown', function (event) {
  var w = window.getCurrent();
  if (event.ctrlKey && event.key === " ") {
    w.setAlwaysOnTop(!alwaysOnTop);
    alwaysOnTop = !alwaysOnTop;
  }

  if (event.key === "Tab") {
    w.setDecorations(!decorations);
    decorations = !decorations;
  }
  if (event.ctrlKey) {
    ctrlPressed = true;
  }
});

document.addEventListener('keyup', function (event) {
    ctrlPressed = false;
  
});
var holdingRightButton = false;
var xInicial = 0;
var yInicial = 0;
var outerPosition: PhysicalPosition;
document.addEventListener('mousedown', (e) => {
  if (e.buttons === 1 && ctrlPressed || e.buttons === 1 && e.detail === 2) {
    e.stopPropagation();
    console.log(e);
    // start dragging if the element has a `tauri-drag-region` data attribute and maximize on double-clicking it
    invoke('tauri', {
      __tauriModule: 'Window',
      message: {
        cmd: 'manage',
        data: {
          cmd: {
            type: e.detail === 2 ? '__toggleMaximize' : 'startDragging'
          }
        }
      }
    })
  }
})


