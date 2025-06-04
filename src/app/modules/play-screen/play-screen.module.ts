import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayScreenRoutingModule } from './play-screen-routing.module';
import { PlayScreenComponent } from './play-screen/play-screen.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MainDeckComponent } from '../../components/main-deck/main-deck.component';
import { MaterialDeckComponent } from '../../components/material-deck/material-deck.component';
import { HandComponent } from '../../components/hand/hand.component';
import { GraveyardComponent } from '../../components/graveyard/graveyard.component';
import { BanishZoneComponent } from '../../components/banish-zone/banish-zone.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PopupModalComponent } from '../../components/popup-modal/popup-modal.component';


@NgModule({
  declarations: [
    PlayScreenComponent,
    MainDeckComponent,
    MaterialDeckComponent,
    HandComponent,
    GraveyardComponent,
    BanishZoneComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatSidenavModule,
    PlayScreenRoutingModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class PlayScreenModule { }
