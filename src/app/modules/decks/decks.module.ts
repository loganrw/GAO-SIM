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



@NgModule({
  declarations: [
    DecksComponent,
    CardDisplayComponent,
  ],
  imports: [
    CommonModule,
    DecksRoutingModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule
  ]
})
export class DecksModule { }
