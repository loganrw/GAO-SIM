import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DecksComponent } from './decks/decks.component';
import { CardDisplayComponent } from '../../components/card-display/card-display.component';
import { DecksRoutingModule } from './decks.routing.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { HeaderModule } from '../../components/header/header.module';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [
    DecksComponent,
    CardDisplayComponent,
  ],
  imports: [
    CommonModule,
    HeaderModule,
    DecksRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule
  ]
})
export class DecksModule { }
