import { Component, OnInit } from '@angular/core';
import { NameGenService } from './services/name-gen/name-generator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Grand Archive Online Sim';

  constructor(private nameGen: NameGenService) { }

  ngOnInit() {
    if (!localStorage.getItem('playerName')) localStorage.setItem('playerName', this.nameGen.generateName());
  }
}


