import { Component, OnInit } from '@angular/core';
import { NameGenService } from './services/name-gen/name-generator';
import { enableProdMode } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Grand Archive Online Sim';

  constructor(private nameGen: NameGenService) {
    enableProdMode();
  }

  ngOnInit() {
    if (!localStorage.getItem('playerName')) localStorage.setItem('playerName', this.nameGen.generateName());
  }
}


