import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-display',
  templateUrl: './card-display.component.html'
})
export class CardDisplayComponent implements OnInit {
  @Input()
  cardData!: Card;
  imageSrc = ''

  ngOnInit(): void {
    if (this.cardData.image) this.imageSrc = this.getCardURL(this.cardData.image)
  }


  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }
}
