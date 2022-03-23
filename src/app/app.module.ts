import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReelCreateComponent } from './reel-create/reel-create.component';
import { SortablejsModule } from 'ngx-sortablejs';
import { ReelPlayerComponent } from './reel-player/reel-player.component';
import { ReelDialogComponent } from './reel-dialog/reel-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ReelCreateComponent,
    ReelPlayerComponent,
    ReelDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    RouterModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  title = 'Image viewer';
}
