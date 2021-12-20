import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReelCreateComponent } from './reel-create/reel-create.component';
import { MenuComponent } from './menu/menu.component';
import { ReelPlayerComponent } from './reel-player/reel-player.component';

const routes: Routes = [
  { path: 'reel-create', component: ReelCreateComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'reel-player', component: ReelPlayerComponent },
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
