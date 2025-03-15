import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../models/card';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('cardFlip', [
      state('false', style({ transform: 'none' })),
      state('true', style({ transform: 'rotateY(180deg)' })),
      transition('false => true', animate('400ms ease-out')),
      transition('true => false', animate('400ms ease-out')),
    ]),
  ],
})
export class CardComponent implements OnInit {
  @Input()
  cardData!: Card;

  cardFlipped = false;
  imageSrc = ''

  ngOnInit(): void {
    if (this.cardData.image) this.imageSrc = this.getCardURL(this.cardData.image)
  }


  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }
}
