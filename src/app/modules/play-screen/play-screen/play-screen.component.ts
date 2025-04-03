import { Component, HostListener, ViewChild } from '@angular/core';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { Deck } from '../../../models/deck';
import { Card } from '../../../models/card';
import { DeckService } from '../../../services/deck-service/deck-service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-play-screen',
  templateUrl: './play-screen.component.html',
  styleUrls: ['./play-screen.component.scss']
})
export class PlayScreenComponent {


  decksQuery = liveQuery(() => db.decks.toArray());
  decks: Deck[] = [];
  selectedDeck: Deck;
  mainDeck: Card[];
  materialDeck: Card[];
  loaded = false;
  hand: Card[];
  currentCard: Card;
  @ViewChild('drawer') drawer: MatSidenav;
  hoverCards: boolean = false;

  constructor(private deckService: DeckService) { }

  ngOnInit() {
    this.loadDecks();
  }


  loadDecks() {
    this.decksQuery.subscribe(decks => {
      this.decks = decks;
      this.loaded = true;
      this.selectedDeck = decks[0];
      this.shuffleDeck();
      this.drawCard(7);
    });
  }

  shuffleDeck() {
    for (let i = 0; i < this.selectedDeck.main.length; i++) {
      // picks the random number between 0 and length of the deck
      let shuffle = Math.floor(Math.random() * (this.selectedDeck.main.length));

      //swap the current with a random position
      [this.selectedDeck.material[i], this.selectedDeck.main[shuffle]] = [this.selectedDeck.main[shuffle], this.selectedDeck.main[i]];
    }
  }

  drawCard(count: number) {
    console.log(this.selectedDeck);
    let drawnCard = this.deckService.drawCard(this.selectedDeck.main, count);
    this.selectedDeck.main = this.selectedDeck.main.filter(card => {
      !drawnCard.includes(card);
    })
    console.log(this.selectedDeck.main);
    this.hand = [...drawnCard];
  }

  viewMaterialDeck() {

  }

  setCurrentCard(card: Card) {
    this.currentCard = card;
  }

  @HostListener('contextmenu')
  showCardInfo() {
    this.drawer.toggle();
    return false;
  }

  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }

}
