import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.scss'
})
export class HandComponent {
  @Input() cards: Card[];
  @Output() currentCard = new EventEmitter<Card>();
  @Output() cardClicked = new EventEmitter<Card>();

  removeCard(selectedCard: Card) {
    this.cards = this.cards.filter(card => card !== selectedCard);
  }

  returnCurrentCard(card: Card) {
    this.currentCard.emit(card);
  }

  returnClickedCard(card: Card) {
    this.cardClicked.emit(card);
  }

  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }

}
