import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyComponent } from './lobby/lobby.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LobbyRoutingModule } from './lobby-routing.module';
import { HeaderModule } from '../../components/header/header.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PopupModalComponent } from '../../components/popup-modal/popup-modal.component';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [
    LobbyComponent,
    PopupModalComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    LobbyRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatPaginatorModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule
  ]
})
export class LobbyModule { }
