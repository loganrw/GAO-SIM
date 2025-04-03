import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsComponent } from './options/options.component';
import { OptionsRoutingModule } from './options-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../../components/header/header.module';



@NgModule({
  declarations: [
    OptionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HeaderModule,
    OptionsRoutingModule,
    ReactiveFormsModule,
  ]
})
export class OptionsModule { }
