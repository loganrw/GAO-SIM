import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayScreenRoutingModule } from './play-screen-routing.module';
import { PlayScreenComponent } from './play-screen/play-screen.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    PlayScreenComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PlayScreenRoutingModule
  ]
})
export class PlayScreenModule { }
