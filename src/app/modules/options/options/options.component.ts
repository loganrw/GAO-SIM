import { Component } from '@angular/core';
import {
  DataSet,
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  pattern,
} from 'obscenity';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent {
  badWordsDataset = new DataSet().addAll(englishDataset)
    .addPhrase((phrase) => phrase.addPattern(pattern`|wetback|`))
    .addPhrase((phrase) => phrase.addPattern(pattern`|coon|`));
  playerName: string | null;
  newPlayerName: string;
  validInput: boolean = true;
  matcher = new RegExpMatcher({
    ...this.badWordsDataset.build(),
    ...englishRecommendedTransformers,
  });
  headerLinks = ['home', 'play', 'decks'];

  ngOnInit() {
    if (localStorage.getItem('playerName')) {
      this.playerName = localStorage.getItem('playerName');
    } else {
      this.playerName = '';
    }
  }

  changeName() {
    // Check for naughty words
    if (this.matcher.getAllMatches(this.newPlayerName).length) {
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
