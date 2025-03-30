import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayScreenRoutingModule } from './play-screen-routing.module';
import { PlayScreenComponent } from './play-screen/play-screen.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MainDeckComponent } from '../../components/main-deck/main-deck.component';


@NgModule({
  declarations: [
    PlayScreenComponent,
    MainDeckComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PlayScreenRoutingModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class PlayScreenModule { }
