import { Component } from '@angular/core';
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent {

  playerName: string | null;
  newPlayerName: string;
  validInput: boolean = true;
  matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  headerLinks = ['home', 'play', 'decks', 'ai'];

  ngOnInit() {
    if (localStorage.getItem('playerName')) {
      this.playerName = localStorage.getItem('playerName');
    } else {
      this.playerName = '';
    }
  }

  changeName() {
    // Check for naughty words
    if (this.matcher.hasMatch(this.newPlayerName)) {
      this.validInput = false;
      return;
    }
    if (this.newPlayerName && this.newPlayerName !== '') {
      localStorage.setItem('playerName', this.newPlayerName);
      location.reload();
    }
  }

  omitSpecialChar(event: any) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }
}
